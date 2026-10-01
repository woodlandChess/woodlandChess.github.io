import { useEffect, useMemo, useRef, useState } from 'react'
import { Chess, type Color, type Square } from 'chess.js'
import {
  getStoredToken, startLogin, handleAuthRedirect, logout,
  LichessClient, TIME_CONTROLS, type TimeControl, type LichessProfile,
} from './lichess'
import { ChessBoard, PromotionModal } from './ChessBoard'

type Phase = 'loading' | 'login' | 'idle' | 'seeking' | 'in-game' | 'finished'

interface LiveGame {
  id: string
  myColor: Color
  opponentName: string
  opponentRating?: number
}

const STATUS_LABEL: Record<string, string> = {
  mate: 'Checkmate', resign: 'Resignation', stalemate: 'Draw — stalemate',
  timeout: 'Opponent left', draw: 'Draw', outoftime: 'Time out',
  aborted: 'Game aborted', cheat: 'Game voided', variantEnd: 'Game over',
  noStart: 'Game aborted', unknownFinish: 'Game over',
}

/** True if moving `from → to` on the current board is a pawn reaching the back rank. */
function isPromotion(game: Chess, from: Square, to: Square): boolean {
  const piece = game.get(from)
  return piece?.type === 'p' && (to.endsWith('8') || to.endsWith('1'))
}

/** Replays a Lichess UCI move list ("e2e4 e7e5 ...") onto a fresh board. */
function replayMoves(movesStr: string): Chess {
  const c = new Chess()
  const list = movesStr.trim().length ? movesStr.trim().split(' ') : []
  for (const uci of list) {
    try {
      c.move({ from: uci.slice(0, 2) as Square, to: uci.slice(2, 4) as Square, promotion: uci[4] })
    } catch { /* ignore malformed token */ }
  }
  return c
}

export function OnlinePlay({ onBack }: { onBack: () => void }) {
  const [phase, setPhase]     = useState<Phase>('loading')
  const [profile, setProfile] = useState<LichessProfile | null>(null)
  const [error, setError]     = useState<string | null>(null)

  const clientRef = useRef<LichessClient | null>(null)
  const chessRef  = useRef(new Chess())
  const [fen, setFen]           = useState(chessRef.current.fen())
  const [selected, setSelected] = useState<Square | null>(null)
  const [pendingPromotion, setPendingPromotion] = useState<{ from: Square; to: Square } | null>(null)
  const [liveGame, setLiveGame]     = useState<LiveGame | null>(null)
  const [resultText, setResultText] = useState<string | null>(null)

  const eventAbortRef = useRef<AbortController | null>(null)
  const gameAbortRef   = useRef<AbortController | null>(null)
  const seekAbortRef   = useRef<AbortController | null>(null)

  // ── Init: process OAuth redirect (if any), then try a stored token ───────
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const fromRedirect = await handleAuthRedirect()
      const token = fromRedirect ?? getStoredToken()
      if (cancelled) return
      if (!token) { setPhase('login'); return }

      const client = new LichessClient(token.access_token)
      clientRef.current = client
      try {
        const prof = await client.getProfile()
        if (cancelled) return
        setProfile(prof)
        setPhase('idle')
        listenForGames(client)
      } catch {
        logout()
        if (!cancelled) setPhase('login')
      }
    })()
    return () => {
      cancelled = true
      eventAbortRef.current?.abort()
      gameAbortRef.current?.abort()
      seekAbortRef.current?.abort()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Account-wide event stream: wait for a match ───────────────────────────
  function listenForGames(client: LichessClient) {
    const ac = new AbortController()
    eventAbortRef.current = ac
    ;(async () => {
      try {
        for await (const evt of client.streamEvents(ac.signal)) {
          if (evt.type === 'gameStart') {
            seekAbortRef.current?.abort()
            const color: Color = evt.game.color === 'white' ? 'w' : 'b'
            joinGame(client, evt.game.gameId, color)
          }
        }
      } catch { /* closed on unmount — fine */ }
    })()
  }

  // ── Per-game stream: board state as it changes ────────────────────────────
  function joinGame(client: LichessClient, gameId: string, myColor: Color) {
    gameAbortRef.current?.abort()
    const ac = new AbortController()
    gameAbortRef.current = ac

    setPhase('in-game')
    setResultText(null)
    setSelected(null)
    setPendingPromotion(null)
    chessRef.current = new Chess()
    setFen(chessRef.current.fen())

    ;(async () => {
      try {
        for await (const evt of client.streamGame(gameId, ac.signal)) {
          if (evt.type === 'gameFull') {
            const opp = myColor === 'w' ? evt.black : evt.white
            setLiveGame({
              id: gameId,
              myColor,
              opponentName: opp?.name ?? opp?.user?.name ?? (opp?.aiLevel ? `Stockfish L${opp.aiLevel}` : 'Opponent'),
              opponentRating: opp?.rating,
            })
            const c = replayMoves(evt.state?.moves ?? '')
            chessRef.current = c
            setFen(c.fen())
            if (evt.state?.status && !['started', 'created'].includes(evt.state.status)) {
              finish(evt.state.status, evt.state.winner, myColor)
            }
          } else if (evt.type === 'gameState') {
            const c = replayMoves(evt.moves ?? '')
            chessRef.current = c
            setFen(c.fen())
            setSelected(null)
            if (evt.status && evt.status !== 'started') {
              finish(evt.status, evt.winner, myColor)
            }
          }
        }
      } catch { /* aborted or closed — fine */ }
    })()
  }

  function finish(status: string, winner: string | undefined, myColor: Color) {
    let text = STATUS_LABEL[status] ?? 'Game over'
    if (winner) {
      const iWon = winner === (myColor === 'w' ? 'white' : 'black')
      text += iWon ? ' — you win' : ' — you lose'
    }
    setResultText(text)
    setPhase('finished')
    gameAbortRef.current?.abort()
  }

  // ── Actions ────────────────────────────────────────────────────────────────
  async function connect() {
    setError(null)
    try { await startLogin() } catch { setError('Could not reach Lichess.') }
  }

  async function findOpponent(tc: TimeControl) {
    const client = clientRef.current
    if (!client) return
    setError(null)
    setPhase('seeking')
    const ac = new AbortController()
    seekAbortRef.current = ac
    try {
      await client.seek(tc, ac.signal)
      // Resolves when matched or cancelled — if we're still "seeking" here,
      // the seek closed without a gameStart event reaching us yet; the
      // event listener will flip the phase once it does.
    } catch {
      /* aborted by cancelSeek(), or matched — both fine */
    }
  }

  function cancelSeek() {
    seekAbortRef.current?.abort()
    setPhase('idle')
  }

  function playAgain() {
    setLiveGame(null)
    setResultText(null)
    setPhase('idle')
  }

  function sendMove(from: Square, to: Square, promotion?: string) {
    if (!liveGame) return
    const uci = `${from}${to}${promotion ?? ''}`
    clientRef.current?.move(liveGame.id, uci).catch(() => setError('Move rejected — board may be out of sync.'))
    setSelected(null)
  }

  function clickSquare(square: Square) {
    if (!liveGame || chessRef.current.isGameOver()) return
    const c = chessRef.current
    if (c.turn() !== liveGame.myColor) return
    const piece   = c.get(square)
    const targets = selected ? c.moves({ square: selected, verbose: true }).map(m => m.to) : []

    if (selected && targets.includes(square)) {
      if (isPromotion(c, selected, square)) {
        setPendingPromotion({ from: selected, to: square })
      } else {
        sendMove(selected, square)
      }
      return
    }
    setSelected(piece?.color === liveGame.myColor ? square : null)
  }

  const game          = useMemo(() => new Chess(fen), [fen])
  const legalTargets  = selected ? game.moves({ square: selected, verbose: true }).map(m => m.to) : []
  const lastMove      = game.history({ verbose: true }).at(-1)
  const myTurn        = !!liveGame && game.turn() === liveGame.myColor

  // ── LOADING ────────────────────────────────────────────────────────────────
  if (phase === 'loading') {
    return (
      <main className="setup-shell">
        <section className="setup-card" aria-busy="true">
          <div className="brand">
            <span className="brand-mark">♞</span>
            <span className="brand-name">Woodland Chess</span>
          </div>
          <p className="setup-copy">Connecting to Lichess…</p>
        </section>
      </main>
    )
  }

  // ── LOGIN ──────────────────────────────────────────────────────────────────
  if (phase === 'login') {
    return (
      <main className="setup-shell">
        <section className="setup-card" aria-labelledby="online-title">
          <div className="brand">
            <span className="brand-mark">♞</span>
            <span className="brand-name">Woodland Chess</span>
          </div>
          <div className="setup-heading">
            <span className="setup-kicker">Online</span>
            <h1 id="online-title">Play a real opponent</h1>
          </div>
          <p className="setup-copy">
            Woodland Chess uses your Lichess account to find you a live opponent and
            relay moves through Lichess's Board API. We never see your password —
            you'll authorize directly on lichess.org and come straight back here.
          </p>
          {error && <p className="online-error">{error}</p>}
          <button className="begin-game" onClick={connect}>Connect with Lichess</button>
          <button className="new-game" style={{ marginTop: '0.75rem' }} onClick={onBack}>Back</button>
        </section>
      </main>
    )
  }

  // ── IDLE (connected, picking time control) ────────────────────────────────
  if (phase === 'idle') {
    return (
      <main className="setup-shell">
        <section className="setup-card" aria-labelledby="online-title">
          <div className="brand">
            <span className="brand-mark">♞</span>
            <span className="brand-name">Woodland Chess</span>
          </div>
          <div className="setup-heading">
            <span className="setup-kicker">Online</span>
            <h1 id="online-title">Find an opponent</h1>
          </div>
          {profile && (
            <p className="setup-copy">
              Connected as <strong>{profile.username}</strong>. Pick a time control to start a seek.
            </p>
          )}
          {error && <p className="online-error">{error}</p>}
          <div className="time-control-grid">
            {TIME_CONTROLS.map(tc => (
              <button key={tc.label} className="time-control-btn" onClick={() => findOpponent(tc)}>
                {tc.label}
              </button>
            ))}
          </div>
          <button className="new-game" style={{ marginTop: '1rem' }} onClick={onBack}>Back</button>
        </section>
      </main>
    )
  }

  // ── SEEKING ────────────────────────────────────────────────────────────────
  if (phase === 'seeking') {
    return (
      <main className="setup-shell">
        <section className="setup-card" aria-busy="true">
          <div className="brand">
            <span className="brand-mark">♞</span>
            <span className="brand-name">Woodland Chess</span>
          </div>
          <div className="setup-heading">
            <span className="setup-kicker">Online</span>
            <h1>Searching for an opponent…</h1>
          </div>
          <p className="setup-copy">Hang tight — this usually takes a few seconds on Lichess.</p>
          <button className="new-game" onClick={cancelSeek}>Cancel</button>
        </section>
      </main>
    )
  }

  // ── IN-GAME / FINISHED ───────────────────────────────────────────────────
  return (
    <main className="app-shell">
      <header>
        <div className="brand">
          <span className="brand-mark">♞</span>
          <span className="brand-name">Woodland Chess</span>
        </div>
        <button className="new-game" onClick={onBack}>Exit</button>
      </header>

      <section className="game-layout">
        <div className="board-wrap">
          <ChessBoard
            board={game.board()}
            onSquareClick={clickSquare}
            selected={selected}
            legalTargets={legalTargets}
            lastFrom={lastMove?.from}
            lastTo={lastMove?.to}
            orientation={liveGame?.myColor ?? 'w'}
            interactive={phase === 'in-game'}
          />
        </div>

        <aside className="sidebar">
          <div className="sidebar-section">
            <div className="opponent">
              <div className="avatar">♟</div>
              <div className="opponent-info">
                <strong>{liveGame?.opponentName ?? 'Opponent'}</strong>
                <span>{liveGame?.opponentRating ? `Rating ${liveGame.opponentRating}` : 'Lichess'}</span>
              </div>
            </div>
          </div>
          <div className="sidebar-section">
            <span className="status-label">Position</span>
            <div className="status" aria-live="polite">
              {resultText ?? (myTurn ? 'Your move' : 'Waiting for opponent…')}
            </div>
          </div>
          <div className="sidebar-section history-section">
            <p className="history-head">Moves</p>
            <div className="history" aria-label="Move history">
              {(() => {
                const hist = game.history()
                return hist.length === 0
                  ? <p>Opening position</p>
                  : Array.from({ length: Math.ceil(hist.length / 2) }, (_, i) => (
                      <div className="move-row" key={i}>
                        <span>{i + 1}.</span>
                        <span>{hist[i * 2]}</span>
                        <span>{hist[i * 2 + 1] ?? ''}</span>
                      </div>
                    ))
              })()}
            </div>
          </div>
          {phase === 'in-game' ? (
            <button className="resign" onClick={() => liveGame && clientRef.current?.resign(liveGame.id)}>
              Resign
            </button>
          ) : (
            <button className="resign" onClick={playAgain}>Find new opponent</button>
          )}
        </aside>
      </section>

      {pendingPromotion && liveGame && (
        <PromotionModal
          color={liveGame.myColor}
          onPick={type => {
            sendMove(pendingPromotion.from, pendingPromotion.to, type)
            setPendingPromotion(null)
          }}
        />
      )}
    </main>
  )
}
