import { useEffect, useMemo, useRef, useState } from 'react'
import { Chess, type Color, type Square } from 'chess.js'
import {
  getStoredToken, startLogin, handleAuthRedirect, logout,
  LichessClient, PERF_META, PERF_ORDER, TIME_CONTROLS, timeControlsFor,
  type Perf, type TimeControl, type LichessProfile,
} from './lichess'
import { ChessBoard, PromotionModal, type TrailMove } from './ChessBoard'
import type { ModeId } from './components/ModeNav'
import { HomeFrame } from './components/HomeFrame'
import { GameScreen, ConfirmButton, type ClockView, type RatingChange } from './components/GameScreen'
import {
  IconBlitz, IconBullet, IconClassical, IconClock, IconOnline, IconRapid, IconShield,
} from './components/ModeIcons'
import {
  freeze, formatTimeControl, remainingMs, runningSide, type ClockState,
} from './clock'

type Phase = 'loading' | 'login' | 'idle' | 'seeking' | 'in-game' | 'finished'
type DrawState = 'none' | 'mine' | 'theirs'

interface LiveGame {
  id: string
  myColor: Color
  myName: string
  myRating?: number
  opponentName: string
  opponentRating?: number
  /** e.g. "10+0 · Rapid · Rated" */
  info?: string
}

const PERF_ICON: Record<Perf, typeof IconBlitz> = {
  bullet: IconBullet, blitz: IconBlitz, rapid: IconRapid, classical: IconClassical,
}

// ── Remembered menu choices ───────────────────────────────────────────────────
const PREFS_KEY = 'woodland-chess:online-prefs'
interface MenuPrefs { perf: Perf; rated: boolean; byPerf: Record<Perf, string> }
const DEFAULT_PREFS: MenuPrefs = {
  perf: 'rapid',
  rated: true,
  byPerf: { bullet: '1+0', blitz: '5+0', rapid: '10+0', classical: '30+0' },
}

function loadPrefs(): MenuPrefs {
  try {
    const raw = JSON.parse(localStorage.getItem(PREFS_KEY) ?? 'null')
    if (!raw) return DEFAULT_PREFS
    const perf: Perf = PERF_ORDER.includes(raw.perf) ? raw.perf : DEFAULT_PREFS.perf
    const byPerf = { ...DEFAULT_PREFS.byPerf }
    for (const p of PERF_ORDER) {
      if (timeControlsFor(p).some(t => t.id === raw.byPerf?.[p])) byPerf[p] = raw.byPerf[p]
    }
    return { perf, byPerf, rated: raw.rated !== false }
  } catch {
    return DEFAULT_PREFS
  }
}

function savePrefs(prefs: MenuPrefs) {
  try { localStorage.setItem(PREFS_KEY, JSON.stringify(prefs)) } catch { /* private mode - fine */ }
}

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)
const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))

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
  const [reviewPly, setReviewPly] = useState<number | null>(null)
  const [drawOffer, setDrawOffer] = useState<DrawState>('none')
  const [prefs, setPrefs] = useState<MenuPrefs>(loadPrefs)
  const [seekingTc, setSeekingTc] = useState<TimeControl | null>(null)
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])
  // Clock snapshot lives in a ref: it changes on every server event but only the
  // <GameClock> components need to tick, not the whole screen.
  const clockRef = useRef<ClockState | null>(null)
  // Rating after a finished rated game, for both players.
  const [ratingChanges, setRatingChanges] = useState<{ me?: RatingChange; opp?: RatingChange } | null>(null)
  const ratingTokenRef = useRef(0)           // invalidates an in-flight lookup when a new game starts
  const gameMetaRef = useRef<{ id: string; rated: boolean; myColor: Color } | null>(null)

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
  function applyClock(state: any, plies: number, finished: boolean) {
    if (typeof state?.wtime !== 'number' || typeof state?.btime !== 'number') {
      clockRef.current = null   // untimed / correspondence game
      return
    }
    clockRef.current = { w: state.wtime, b: state.btime, at: performance.now(), running: runningSide(plies, finished) }
  }

  function applyDraw(state: any, myColor: Color) {
    const theirs = myColor === 'w' ? state?.bdraw : state?.wdraw
    const mine   = myColor === 'w' ? state?.wdraw : state?.bdraw
    setDrawOffer(theirs ? 'theirs' : mine ? 'mine' : 'none')
  }

  function joinGame(client: LichessClient, gameId: string, myColor: Color) {
    gameAbortRef.current?.abort()
    const ac = new AbortController()
    gameAbortRef.current = ac

    setPhase('in-game')
    setResultText(null)
    setReviewPly(null)
    setSelected(null)
    setPendingPromotion(null)
    setDrawOffer('none')
    setRatingChanges(null)
    ratingTokenRef.current++
    gameMetaRef.current = { id: gameId, rated: false, myColor }
    setError(null)
    chessRef.current = new Chess()
    setFen(chessRef.current.fen())
    pendingMoveRef.current = null
    confirmedMovesRef.current = ''
    optimisticPlyRef.current = 0
    clockRef.current = null
    // A new game always starts with the board in view, even if the menu was scrolled.
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior })

    ;(async () => {
      // Mobile browsers drop background streams. If the stream closes without the
      // game being over, reconnect: Lichess replies with a fresh `gameFull`, which
      // resyncs board and clocks from scratch.
      let attempt = 0
      while (!ac.signal.aborted) {
        try {
          for await (const evt of client.streamGame(gameId, ac.signal)) {
            attempt = 0
            if (evt.type === 'gameFull') {
              const opp = myColor === 'w' ? evt.black : evt.white
              const me  = myColor === 'w' ? evt.white : evt.black
              const label = (pl: any, fallback: string) => {
                const name = pl?.name ?? pl?.user?.name ?? (pl?.aiLevel ? `Stockfish L${pl.aiLevel}` : fallback)
                return pl?.title ? `${pl.title} ${name}` : name
              }
              const tc = evt.clock && typeof evt.clock.initial === 'number'
                ? `${formatTimeControl(evt.clock.initial, evt.clock.increment ?? 0)}${evt.speed ? ` · ${cap(evt.speed)}` : ''}`
                : 'Untimed'
              if (gameMetaRef.current) gameMetaRef.current.rated = !!evt.rated
              const moves = evt.state?.moves ?? ''
              const c = replayMoves(moves)
              const finished = !!evt.state?.status && !['started', 'created'].includes(evt.state.status)
              applyClock(evt.state, c.history().length, finished)
              applyDraw(evt.state, myColor)
              setLiveGame({
                id: gameId,
                myColor,
                myName: label(me, profile?.username ?? 'You'),
                myRating: me?.rating,
                opponentName: label(opp, 'Opponent'),
                opponentRating: opp?.rating,
                info: `${tc} · ${evt.rated ? 'Rated' : 'Casual'}`,
              })
              confirmedMovesRef.current = moves
              chessRef.current = c
              setFen(c.fen())
              setReviewPly(null)
              if (finished) finish(evt.state.status, evt.state.winner, myColor)
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
              const finished = !!evt.status && evt.status !== 'started'
              applyClock(evt, c.history().length, finished)
              applyDraw(evt, myColor)
              confirmedMovesRef.current = moves
              chessRef.current = c
              setFen(c.fen())
              setReviewPly(null)
              setSelected(null)
              if (finished) finish(evt.status, evt.winner, myColor)
            }
          }
        } catch { /* aborted or closed - handled below */ }
        if (ac.signal.aborted) break
        await sleep(Math.min(1000 * 2 ** attempt, 8000))
        attempt++
      }
    })()
  }

  function finish(status: string, winner: string | undefined, myColor: Color) {
    let text = STATUS_LABEL[status] ?? 'Game over'
    if (winner) {
      const iWon = winner === (myColor === 'w' ? 'white' : 'black')
      text += iWon ? ' - you win' : ' - you lose'
    }
    if (clockRef.current) clockRef.current = freeze(clockRef.current, performance.now())
    setDrawOffer('none')
    setResultText(text)
    setPhase('finished')
    gameAbortRef.current?.abort()
    // Pull fresh ratings so the menu is up to date when the player comes back to it.
    clientRef.current?.getProfile().then(setProfile).catch(() => { /* keep the old numbers */ })
    // Rated games that actually got going: show both players' new ratings.
    const meta = gameMetaRef.current
    if (meta?.rated && !['aborted', 'noStart'].includes(status)) void loadRatingChanges(meta.id, myColor)
  }

  /** Lichess settles ratings a moment after the game ends, so retry briefly. */
  async function loadRatingChanges(gameId: string, myColor: Color) {
    const token = ++ratingTokenRef.current
    for (let attempt = 0; attempt < 6; attempt++) {
      if (token !== ratingTokenRef.current) return
      try {
        const r = await clientRef.current?.getGameRatings(gameId)
        if (r && token === ratingTokenRef.current) {
          const mk = (side: { rating?: number; diff?: number }): RatingChange | undefined =>
            side.rating !== undefined && side.diff !== undefined ? { after: side.rating + side.diff, diff: side.diff } : undefined
          const me = mk(myColor === 'w' ? r.white : r.black)
          const opp = mk(myColor === 'w' ? r.black : r.white)
          if (me || opp) { setRatingChanges({ me, opp }); return }
        }
      } catch { /* try again */ }
      await sleep(1200)
    }
  }

  // ── Actions ────────────────────────────────────────────────────────────────
  async function connect() {
    setError(null)
    try { await startLogin() } catch { setError('Could not reach Lichess.') }
  }

  function updatePrefs(next: MenuPrefs) {
    setPrefs(next)
    savePrefs(next)
  }

  function selectPerf(perf: Perf) {
    if (perf !== prefs.perf) updatePrefs({ ...prefs, perf })
  }

  function onTabKey(e: React.KeyboardEvent) {
    const i = PERF_ORDER.indexOf(prefs.perf)
    const n = e.key === 'ArrowRight' ? (i + 1) % PERF_ORDER.length
            : e.key === 'ArrowLeft'  ? (i + PERF_ORDER.length - 1) % PERF_ORDER.length
            : e.key === 'Home' ? 0
            : e.key === 'End' ? PERF_ORDER.length - 1
            : -1
    if (n < 0) return
    e.preventDefault()
    selectPerf(PERF_ORDER[n])
    tabRefs.current[n]?.focus()
  }

  async function findOpponent(tc: TimeControl, rated: boolean) {
    const client = clientRef.current
    if (!client) return
    setError(null)
    setSeekingTc(tc)
    setPhase('seeking')
    const ac = new AbortController()
    seekAbortRef.current = ac
    try {
      await client.seek(tc, ac.signal, rated)
      // Resolves when matched or closed - the account event stream flips the
      // phase to in-game once Lichess announces the game.
    } catch (e) {
      if (ac.signal.aborted) return   // cancelled by us, or matched
      setError(e instanceof Error ? e.message : 'Could not start a search.')
      // Only fall back to the menu if we are still searching (not already matched).
      setPhase(p => (p === 'seeking' ? 'idle' : p))
    }
  }

  function cancelSeek() {
    seekAbortRef.current?.abort()
    setPhase('idle')
  }

  function playAgain() {
    setLiveGame(null)
    setResultText(null)
    setRatingChanges(null)
    ratingTokenRef.current++
    clockRef.current = null
    setPhase('idle')
    clientRef.current?.getProfile().then(setProfile).catch(() => { /* keep the old numbers */ })
  }

  function respondToDraw(answer: 'yes' | 'no') {
    if (!liveGame) return
    if (answer === 'no') setDrawOffer('none')
    clientRef.current?.draw(liveGame.id, answer)
      .then(() => { if (answer === 'yes') setDrawOffer('none') })
      .catch(() => setError('Could not send your draw response. Try again.'))
  }

  function offerDraw() {
    if (!liveGame) return
    setDrawOffer('mine')
    clientRef.current?.draw(liveGame.id, 'yes').catch(() => {
      setDrawOffer('none')
      setError('Could not offer a draw right now.')
    })
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
    // Hand the clock to the opponent immediately; Lichess's next state corrects any drift.
    if (clockRef.current) {
      const frozen = freeze(clockRef.current, performance.now())
      clockRef.current = { ...frozen, running: runningSide(optimisticPlyRef.current, false) }
    }
    setFen(chessRef.current.fen())
    setSelected(null)
    clientRef.current?.move(liveGame.id, uci).catch(() => {
      pendingMoveRef.current = null
      const confirmed = replayMoves(confirmedMovesRef.current)
      if (clockRef.current) clockRef.current = { ...clockRef.current, running: runningSide(confirmed.history().length, false), at: performance.now() }
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
  // `game` is rebuilt from the FEN, which carries no move list - so history
  // must come from the replayed game in chessRef. Every update to chessRef is
  // followed by setFen(), so keying on `fen` keeps this in sync.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const moveHistory   = useMemo(() => chessRef.current.history({ verbose: true }), [fen])
  const viewedPly = reviewPly ?? moveHistory.length
  const viewedGame = useMemo(() => {
    const c = new Chess()
    moveHistory.slice(0, viewedPly).forEach(m => c.move(m))
    return c
  }, [moveHistory, viewedPly])
  // Last move of each side as of the position on screen (follows review), newest first.
  const trail = useMemo<TrailMove[]>(
    () => moveHistory.slice(Math.max(0, viewedPly - 2), viewedPly).reverse().map(m => ({ from: m.from, to: m.to, color: m.color })),
    [moveHistory, viewedPly],
  )
  const material = useMemo(() => {
    const values: Record<string, number> = { p: 1, n: 3, b: 3, r: 5, q: 9 }
    const totals = { w: 0, b: 0 }
    viewedGame.board().flat().forEach(piece => { if (piece) totals[piece.color] += values[piece.type] ?? 0 })
    return { white: totals.w, black: totals.b }
  }, [viewedGame])
  const myTurn        = !!liveGame && game.turn() === liveGame.myColor
  const plies         = moveHistory.length

  // Menu selection (validated so a stale saved id can never leave nothing selected).
  const perfTcs  = timeControlsFor(prefs.perf)
  const selectedTc: TimeControl = perfTcs.find(t => t.id === prefs.byPerf[prefs.perf]) ?? perfTcs[0] ?? TIME_CONTROLS[0]

  // Clocks: one view per side, read lazily so only the <GameClock>s re-render as time passes.
  const clockSnapshot = clockRef.current
  const clockFor = (color: Color): ClockView | null => clockSnapshot
    ? { read: () => (clockRef.current ? remainingMs(clockRef.current, color, performance.now()) : 0), active: phase === 'in-game' && clockSnapshot.running === color }
    : null

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

  // ── IDLE (connected, picking a game) ──────────────────────────────────────
  if (phase === 'idle') {
    const perfData  = profile?.perfs?.[prefs.perf]
    const games     = perfData?.games ?? 0
    const provisional = !!perfData && (perfData.prov || games === 0)
    const prog      = perfData?.prog ?? 0
    const PerfIcon  = PERF_ICON[prefs.perf]
    return (
      <HomeFrame mode="online" onNavigate={onNavigate} compact titleId="online-title"
        kicker="Online" title="Find an opponent"
        copy="Choose a speed, pick a time control, then play. Your rating for that speed shows below."
        actions={
          <>
            <div className="home-summary" aria-hidden="true">
              <span>{PERF_META[prefs.perf].label}</span><i /><span>{selectedTc.id}</span><i /><span>{prefs.rated ? 'Rated' : 'Casual'}</span>
            </div>
            <button type="button" className="begin-game" onClick={() => findOpponent(selectedTc, prefs.rated)}>
              Play {selectedTc.id}
            </button>
          </>
        }>
        <div className="home-body">
          {profile && (
            <div className="online-account">
              <p className="conn-chip"><i aria-hidden="true" />Connected as <strong>{profile.username}</strong></p>
              <button type="button" className="online-link" onClick={() => { logout(); clientRef.current = null; setProfile(null); setPhase('login') }}>Sign out</button>
            </div>
          )}
          {error && <p className="online-error" role="alert">{error}</p>}

          <div className="perf-tabs" role="tablist" aria-label="Game speed" onKeyDown={onTabKey}>
            {PERF_ORDER.map((perf, i) => {
              const Icon = PERF_ICON[perf]
              const on = perf === prefs.perf
              return (
                <button key={perf} type="button" role="tab" id={`perf-tab-${perf}`}
                  ref={el => { tabRefs.current[i] = el }}
                  aria-selected={on} aria-controls="perf-panel" tabIndex={on ? 0 : -1}
                  className="perf-tab" onClick={() => selectPerf(perf)}>
                  <Icon className="perf-tab-icon" />
                  <span>{PERF_META[perf].label}</span>
                </button>
              )
            })}
          </div>

          <div className="perf-panel" id="perf-panel" role="tabpanel" aria-labelledby={`perf-tab-${prefs.perf}`}>
            <div className="perf-rating" aria-live="polite">
              <PerfIcon className="perf-rating-icon" />
              <div className="perf-rating-main">
                <span className="perf-rating-label">Your {PERF_META[prefs.perf].label} rating</span>
                <strong className="perf-rating-value">
                  {perfData ? perfData.rating : '—'}
                  {provisional && <sup title="Provisional rating">?</sup>}
                </strong>
              </div>
              <div className="perf-rating-side">
                {prog !== 0 && (
                  <span className={`perf-prog perf-prog--${prog > 0 ? 'up' : 'down'}`}>
                    {prog > 0 ? '▲' : '▼'} {Math.abs(prog)}
                  </span>
                )}
                <span className="perf-games">
                  {!perfData ? 'No data yet'
                    : games === 0 ? 'No rated games yet'
                    : provisional ? `${games} game${games === 1 ? '' : 's'} · provisional`
                    : `${games.toLocaleString()} games`}
                </span>
              </div>
            </div>
            <p className="perf-blurb">{PERF_META[prefs.perf].blurb}</p>

            <div className="tc-grid" role="radiogroup" aria-label={`${PERF_META[prefs.perf].label} time control`}>
              {perfTcs.map(tc => {
                const checked = tc.id === selectedTc.id
                return (
                  <label key={tc.id} className={`tc-opt${checked ? ' is-on' : ''}`}>
                    <input type="radio" name="time-control" value={tc.id} checked={checked}
                      onChange={() => updatePrefs({ ...prefs, byPerf: { ...prefs.byPerf, [prefs.perf]: tc.id } })} />
                    <span className="tc-face">
                      <span className="tc-time">{tc.time}<em>+</em>{tc.increment}</span>
                      <span className="tc-kind">
                        {tc.time} min{tc.increment ? ` · +${tc.increment}s` : ' · no inc.'}
                      </span>
                      <IconClock className="tc-icon" />
                    </span>
                  </label>
                )
              })}
            </div>
          </div>

          <fieldset className="field rated-field">
            <legend className="field-label">Game type</legend>
            <div className="seg" style={{ gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' }}>
              {([true, false] as const).map(r => (
                <label key={String(r)} className="seg-opt">
                  <input type="radio" name="rated" checked={prefs.rated === r} onChange={() => updatePrefs({ ...prefs, rated: r })} />
                  <span className="seg-face">{r ? 'Rated' : 'Casual'}</span>
                </label>
              ))}
            </div>
            <p className="field-hint">{prefs.rated ? 'Results change your rating.' : 'Practice games - your rating is not affected.'}</p>
          </fieldset>
        </div>
      </HomeFrame>
    )
  }

  // ── SEEKING ────────────────────────────────────────────────────────────────
  if (phase === 'seeking') {
    return (
      <HomeFrame mode="online" onNavigate={onNavigate} compact busy titleId="online-title"
        kicker="Online" title="Searching for an opponent…"
        copy={seekingTc
          ? `${seekingTc.id} ${PERF_META[seekingTc.perf].label} · ${prefs.rated ? 'Rated' : 'Casual'}. This usually takes a few seconds.`
          : 'Hang tight — this usually takes a few seconds on Lichess.'}
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
  // Short, single-line copy: the status card must never change height between turns.
  const myStatus = myTurn
    ? (plies < 2 ? 'Your move · move soon' : 'Your move')
    : 'Opponent’s move'
  return (
    <GameScreen
      exitLabel="Exit"
      exitConfirmLabel={inGame ? 'Tap to leave' : undefined}
      onExit={onBack}
      opponent={{
        name: liveGame?.opponentName ?? 'Opponent',
        meta: liveGame?.opponentRating ? `Lichess rating ${liveGame.opponentRating}` : 'Rated Lichess game',
        glyph: '♟',
        ratingChange: ratingChanges?.opp,
      }}
      opponentClock={liveGame ? clockFor(liveGame.myColor === 'w' ? 'b' : 'w') : null}
      self={liveGame ? {
        name: liveGame.myName,
        meta: liveGame.myRating ? `Lichess rating ${liveGame.myRating}` : 'You',
        glyph: '♙',
        ratingChange: ratingChanges?.me,
      } : undefined}
      selfClock={liveGame ? clockFor(liveGame.myColor) : null}
      status={resultText ?? myStatus}
      statusMeta={liveGame?.info}
      tone={!inGame ? 'over' : myTurn ? 'turn' : 'wait'}
      moves={moveHistory.map(m => m.san)}
      selectedPly={viewedPly}
      onSelectPly={ply => setReviewPly(ply === moveHistory.length ? null : ply)}
      material={material}
      notice={error}
      extra={inGame && drawOffer === 'theirs' ? (
        <div className="gm-card gm-offer" role="group" aria-label="Draw offer">
          <span>Your opponent offers a draw</span>
          <div className="gm-offer-actions">
            <button type="button" className="gm-offer-btn gm-offer-btn--accept" onClick={() => respondToDraw('yes')}>Accept</button>
            <button type="button" className="gm-offer-btn" onClick={() => respondToDraw('no')}>Decline</button>
          </div>
        </div>
      ) : null}
      actions={inGame ? (
        plies < 2 ? (
          <button type="button" className="btn-ghost" onClick={() => liveGame && clientRef.current?.abort(liveGame.id)}>Abort game</button>
        ) : (
          <>
            <button type="button" className="btn-ghost" disabled={drawOffer === 'mine'} onClick={offerDraw}>
              {drawOffer === 'mine' ? 'Draw offered' : 'Offer draw'}
            </button>
            <ConfirmButton className="btn-ghost btn-danger" label="Resign" confirmLabel="Tap again to resign"
              onConfirm={() => liveGame && clientRef.current?.resign(liveGame.id)} />
          </>
        )
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
        board={viewedGame.board()}
        onSquareClick={clickSquare}
        selected={selected}
        legalTargets={legalTargets}
        trail={trail}
        orientation={liveGame?.myColor ?? 'w'}
        interactive={inGame && reviewPly === null}
      />
    </GameScreen>
  )
}
