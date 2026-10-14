import { useEffect, useMemo, useRef, useState } from 'react'
import { Chess, type Color, type Square } from 'chess.js'
import {
  getStoredToken, startLogin, handleAuthRedirect, logout,
  LichessClient, TIME_CONTROLS, type TimeControl, type LichessProfile,
} from './lichess'
import { ChessBoard, PromotionModal } from './ChessBoard'
import type { ModeId } from './components/ModeNav'
import { HomeFrame } from './components/HomeFrame'
import { GameScreen, ConfirmButton } from './components/GameScreen'
import { IconClock, IconOnline, IconShield } from './components/ModeIcons'

type Phase = 'loading' | 'login' | 'idle' | 'seeking' | 'in-game' | 'finished'

interface LiveGame {
  id: string
  myColor: Color
  opponentName: string
  opponentRating?: number
}

const STATUS_LABEL: Record<string, string> = {
  mate: 'Checkmate', resign: 'Resignation', stalemate: 'Draw - stalemate',
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

/** Elapsed seconds while searching, formatted m:ss. */
function SeekTimer() {
  const [secs, setSecs] = useState(0)
  useEffect(() => {
    const t = window.setInterval(() => setSecs(n => n + 1), 1000)
    return () => window.clearInterval(t)
  }, [])
  return <span className="seek-timer">{Math.floor(secs / 60)}:{String(secs % 60).padStart(2, '0')}</span>
}

export function OnlinePlay({ onBack, onNavigate }: { onBack: () => void; onNavigate: (m: ModeId) => void }) {
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
  const pendingMoveRef = useRef<string | null>(null)
  const confirmedMovesRef = useRef('')
  const optimisticPlyRef = useRef(0)

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
      } catch { /* closed on unmount - fine */ }
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
    pendingMoveRef.current = null
    confirmedMovesRef.current = ''
    optimisticPlyRef.current = 0

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
            const moves = evt.moves ?? ''
            const moveList = moves.trim() ? moves.trim().split(/\s+/) : []
            if (pendingMoveRef.current) {
              if (moveList.includes(pendingMoveRef.current)) {
                pendingMoveRef.current = null
              } else if (moveList.length < optimisticPlyRef.current) {
                continue
              } else {
                pendingMoveRef.current = null
              }
            }
            const c = replayMoves(moves)
            confirmedMovesRef.current = moves
            chessRef.current = c
            setFen(c.fen())
            setSelected(null)
            if (evt.status && evt.status !== 'started') {
              finish(evt.status, evt.winner, myColor)
            }
          }
        }
      } catch { /* aborted or closed - fine */ }
    })()
  }

  function finish(status: string, winner: string | undefined, myColor: Color) {
    let text = STATUS_LABEL[status] ?? 'Game over'
    if (winner) {
      const iWon = winner === (myColor === 'w' ? 'white' : 'black')
      text += iWon ? ' - you win' : ' - you lose'
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
      // Resolves when matched or cancelled - if we're still "seeking" here,
      // the seek closed without a gameStart event reaching us yet; the
      // event listener will flip the phase once it does.
    } catch {
      /* aborted by cancelSeek(), or matched - both fine */
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
    if (pendingMoveRef.current) return
    try {
      chessRef.current.move({ from, to, ...(promotion ? { promotion } : {}) })
    } catch {
      return
    }
    pendingMoveRef.current = uci
    optimisticPlyRef.current = chessRef.current.history().length
    setFen(chessRef.current.fen())
    setSelected(null)
    clientRef.current?.move(liveGame.id, uci).catch(() => {
      pendingMoveRef.current = null
      const confirmed = replayMoves(confirmedMovesRef.current)
      chessRef.current = confirmed
      setFen(confirmed.fen())
      setError('Move rejected by Lichess. The board has been resynchronized.')
    })
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
      <HomeFrame mode="online" onNavigate={onNavigate} compact busy
        kicker="Online" title="Connecting…" titleId="online-title">
        <div className="home-body">
          <div className="online-wait" role="status">
            <span className="spinner" aria-hidden="true" />
            <p>Connecting to Lichess…</p>
          </div>
        </div>
      </HomeFrame>
    )
  }

  // ── LOGIN ──────────────────────────────────────────────────────────────────
  if (phase === 'login') {
    return (
      <HomeFrame mode="online" onNavigate={onNavigate} compact titleId="online-title"
        kicker="Online" title="Play a real opponent"
        copy="Woodland Chess uses your Lichess account to find you a live opponent and relay moves through Lichess's Board API."
        actions={<button type="button" className="begin-game" onClick={connect}>Connect with Lichess</button>}
      >
        <div className="home-body">
          {error && <p className="online-error" role="alert">{error}</p>}
          <ul className="feature-list">
            <li><IconShield className="feature-icon" /><div><strong>Your password stays with Lichess</strong><span>We never see it. You authorize directly on lichess.org.</span></div></li>
            <li><IconOnline className="feature-icon" /><div><strong>One redirect, then straight back</strong><span>Sign in once and you return here, ready to play.</span></div></li>
            <li><IconClock className="feature-icon" /><div><strong>Live games, real opponents</strong><span>Choose a time control and get matched in seconds.</span></div></li>
          </ul>
        </div>
      </HomeFrame>
    )
  }

  // ── IDLE (connected, picking time control) ────────────────────────────────
  if (phase === 'idle') {
    return (
      <HomeFrame mode="online" onNavigate={onNavigate} compact titleId="online-title"
        kicker="Online" title="Find an opponent"
        copy="Pick a time control to start a seek.">
        <div className="home-body">
          {profile && (
            <p className="conn-chip"><i aria-hidden="true" />Connected as <strong>{profile.username}</strong></p>
          )}
          {error && <p className="online-error" role="alert">{error}</p>}
          <div className="tc-grid" role="group" aria-label="Time control">
            {TIME_CONTROLS.map(tc => {
              const [clock, kind] = tc.label.split(' · ')
              return (
                <button key={tc.label} type="button" className="tc-btn" onClick={() => findOpponent(tc)}>
                  <IconClock className="tc-icon" />
                  <span className="tc-time">{clock}</span>
                  <span className="tc-kind">{kind}</span>
                </button>
              )
            })}
          </div>
        </div>
      </HomeFrame>
    )
  }

  // ── SEEKING ────────────────────────────────────────────────────────────────
  if (phase === 'seeking') {
    return (
      <HomeFrame mode="online" onNavigate={onNavigate} compact busy titleId="online-title"
        kicker="Online" title="Searching for an opponent…"
        copy="Hang tight — this usually takes a few seconds on Lichess."
        actions={<button type="button" className="btn-ghost" onClick={cancelSeek}>Cancel search</button>}
      >
        <div className="home-body">
          <div className="online-wait" role="status">
            <span className="seek-orb" aria-hidden="true"><i /><i /><b>♞</b></span>
            <SeekTimer />
          </div>
        </div>
      </HomeFrame>
    )
  }

  // ── IN-GAME / FINISHED ───────────────────────────────────────────────────
  const inGame = phase === 'in-game'
  return (
    <GameScreen
      exitLabel="Exit"
      onExit={onBack}
      opponent={{
        name: liveGame?.opponentName ?? 'Opponent',
        meta: liveGame?.opponentRating ? `Rating ${liveGame.opponentRating}` : 'Lichess',
        glyph: '♟',
      }}
      status={resultText ?? (myTurn ? 'Your move' : 'Waiting for opponent…')}
      tone={!inGame ? 'over' : myTurn ? 'turn' : 'wait'}
      moves={game.history()}
      notice={error}
      actions={inGame ? (
        <ConfirmButton className="btn-ghost btn-danger" label="Resign" confirmLabel="Tap again to resign"
          onConfirm={() => liveGame && clientRef.current?.resign(liveGame.id)} />
      ) : (
        <button type="button" className="btn-ghost" onClick={playAgain}>Find new opponent</button>
      )}
      overlay={pendingPromotion && liveGame && (
        <PromotionModal
          color={liveGame.myColor}
          onPick={type => {
            sendMove(pendingPromotion.from, pendingPromotion.to, type)
            setPendingPromotion(null)
          }}
        />
      )}
    >
      <ChessBoard
        board={game.board()}
        onSquareClick={clickSquare}
        selected={selected}
        legalTargets={legalTargets}
        lastFrom={lastMove?.from}
        lastTo={lastMove?.to}
        orientation={liveGame?.myColor ?? 'w'}
        interactive={inGame}
      />
    </GameScreen>
  )
}
