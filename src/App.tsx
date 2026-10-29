import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { Chess, type Color, type Move, type Square } from 'chess.js'
import { gameStatus, schoolWeights, type Difficulty } from './engine'
import { schoolBookMove, schools, StockfishClient, type ChessSchool } from './stockfish'
import { ChessBoard, PromotionModal } from './ChessBoard'
import type { ModeId } from './components/ModeNav'
import { HomeFrame } from './components/HomeFrame'
import { Segmented, WeightBar } from './components/Controls'
import { computerGameId, recordComputerGame } from './profile/store'
import { GameResultDialog, GameScreen, OnlinePlay, PuzzleMode, PlayerProfile, warmUpWhenIdle } from './lazyModes'
import { sound, soundForMove, soundForOutcome, type Outcome } from './sound'

// ── Dropdown ──────────────────────────────────────────────────────────────────
type DropdownOption = { value: string; label: string; summary?: string }

function Dropdown({ label, value, options, onChange }: {
  label: string; value: string; options: DropdownOption[]
  onChange: (v: string) => void
}) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const current = options.find(o => o.value === value)

  useEffect(() => {
    if (!open) return
    const onPD  = (e: PointerEvent)  => { if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false) }
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('pointerdown', onPD)
    document.addEventListener('keydown', onKey)
    return () => { document.removeEventListener('pointerdown', onPD); document.removeEventListener('keydown', onKey) }
  }, [open])

  return (
    <div className="dropdown" ref={rootRef}>
      <span className="dropdown-label">{label}</span>
      <button type="button" className="dropdown-trigger" aria-haspopup="listbox"
        aria-expanded={open} onClick={() => setOpen(o => !o)}>
        <span>{current?.label ?? value}</span>
        <svg className="dropdown-chevron" width="10" height="6" viewBox="0 0 10 6" aria-hidden="true">
          <path d="M0 0l5 6 5-6z" fill="currentColor" />
        </svg>
      </button>
      {current?.summary && <small className="school-summary">{current.summary}</small>}
      {open && (
        <>
          <div className="dropdown-scrim" onClick={() => setOpen(false)} />
          <ul className="dropdown-menu" role="listbox" aria-label={label}>
            <li className="dropdown-menu-handle" role="presentation" aria-hidden="true"><span /></li>
            {options.map(opt => (
              <li key={opt.value} role="presentation">
                <button type="button" role="option" aria-selected={opt.value === value}
                  className="dropdown-option" onClick={() => { onChange(opt.value); setOpen(false) }}>
                  <span>{opt.label}</span>
                  {opt.value === value && (
                    <svg width="12" height="10" viewBox="0 0 12 10" aria-hidden="true">
                      <path d="M1 5l3.5 3.5L11 1" stroke="currentColor" strokeWidth="1.6"
                        fill="none" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
}

// ── App ───────────────────────────────────────────────────────────────────────
export function App() {
  type Mode = ModeId
  const modeFromPath = (path: string): Mode => path.replace(/\/$/, '') === '/puzzle' ? 'puzzle' : path.replace(/\/$/, '') === '/multiplayer' ? 'online' : path.replace(/\/$/, '') === '/profile' ? 'profile' : 'ai'
  const pathForMode = (next: Mode) => next === 'puzzle' ? '/puzzle' : next === 'online' ? '/multiplayer' : next === 'profile' ? '/profile' : '/ai'
  const [mode, setMode] = useState<Mode>(() => {
    if (new URLSearchParams(window.location.search).has('code') && sessionStorage.getItem('woodland-chess:oauth-return-path') === '/multiplayer') return 'online'
    return modeFromPath(window.location.pathname)
  })

  useEffect(() => { warmUpWhenIdle() }, [])

  useEffect(() => {
    if (window.location.pathname === '/' && !window.location.search) window.history.replaceState({}, '', '/ai')
    const onPopState = () => setMode(modeFromPath(window.location.pathname))
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  const navigateMode = (next: Mode) => {
    window.history.pushState({}, '', pathForMode(next))
    setMode(next)
  }

  const gameRef   = useRef(new Chess())
  const engineRef = useRef<StockfishClient | null>(null)
  const [fen,              setFen]              = useState(gameRef.current.fen())
  const boardDomRef = useRef<HTMLDivElement>(null)
  const [history,          setHistory]          = useState<Move[]>([])
  const [selected,         setSelected]         = useState<Square | null>(null)
  const [difficulty,       setDifficulty]       = useState<Difficulty>('Classic')
  const [school,           setSchool]           = useState<ChessSchool>('Universal')
  const [player,           setPlayer]           = useState<Color>('w')
  const [sideChoice,       setSideChoice]       = useState<Color | 'random'>('w')
  const [setupOpen,        setSetupOpen]        = useState(true)
  const [resultOpen,       setResultOpen]       = useState(false)
  const playerRef = useRef<Color>('w')
  playerRef.current = player
  const [pendingPromotion, setPendingPromotion] = useState<{ from: Square; to: Square } | null>(null)

  const game         = useMemo(() => new Chess(fen), [fen])
  const legalTargets = selected ? game.moves({ square: selected, verbose: true }).map(m => m.to) : []
  const status       = gameStatus(game, player)
  const w            = schools[school].weights

  const sw           = schoolWeights[school] ?? schoolWeights.Universal
  void sw

  useEffect(() => {
    engineRef.current = new StockfishClient()
    return () => engineRef.current?.dispose()
  }, [])

  const sync = () => {
    const g = gameRef.current
    const h = g.history({ verbose: true })
    setFen(g.fen())
    setHistory(h)
    setSelected(null)
    const last = h.at(-1)
    if (last) sound.play(soundForMove(last))
    if (g.isGameOver()) {
      const chime = soundForOutcome(g.isCheckmate() ? (g.turn() === playerRef.current ? 'loss' : 'win') : 'draw')
      if (chime) window.setTimeout(() => sound.play(chime), 450)
    }
  }

  const start = (side: Color = player) => {
    gameRef.current = new Chess()
    setPlayer(side)
    setFen(gameRef.current.fen())
    setHistory([])
    setSelected(null)
    setPendingPromotion(null)
    setSetupOpen(false)
    sound.play('start')
  }

  const commit = (from: Square, to: Square, promotion = 'q') => {
    try { gameRef.current.move({ from, to, promotion }); sync() } catch { return }
  }

  const over = game.isGameOver()
  useEffect(() => {
    if (!over || history.length < 2) return
    recordComputerGame({
      userColor: player,
      result: game.isCheckmate() ? (game.turn() === player ? 'loss' : 'win') : 'draw',
      moves: history.map(m => `${m.from}${m.to}${m.promotion ?? ''}`),
    })
  }, [over, history, player, game])
  useEffect(() => {
    if (!over || setupOpen) { setResultOpen(false); return }
    const t = window.setTimeout(() => setResultOpen(true), 750)   // a beat to take in the final position
    return () => window.clearTimeout(t)
  }, [over, setupOpen])

  const clickSquare = (square: Square) => {
    if (game.isGameOver() || game.turn() !== player || pendingPromotion) return
    const piece = game.get(square)
    if (selected && legalTargets.includes(square)) {
      const moving = game.get(selected)
      if (moving?.type === 'p' && (square.endsWith('8') || square.endsWith('1'))) {
        setPendingPromotion({ from: selected, to: square })
      } else {
        commit(selected, square)
      }
      return
    }
    setSelected(piece?.color === player ? square : null)
  }

  useEffect(() => {
    if (setupOpen || game.isGameOver() || game.turn() === player || pendingPromotion) return
    const timer = window.setTimeout(async () => {
      const current  = gameRef.current
      const played   = current.history({ verbose: true }).map(m => `${m.from}${m.to}${m.promotion ?? ''}`)
      const bookMove = schoolBookMove(school, played)
      const uci      = bookMove ?? await engineRef.current?.bestMove(current.fen(), difficulty) ?? null
      if (!uci || current !== gameRef.current || current.isGameOver() || current.turn() === playerRef.current) return
      try {
        gameRef.current.move({ from: uci.slice(0,2) as Square, to: uci.slice(2,4) as Square, promotion: uci[4] })
        sync()
      } catch { /* discard stale */ }
    }, 80)
    return () => window.clearTimeout(timer)
  }, [fen, player, difficulty, school, pendingPromotion, setupOpen])

  const trail = history.slice(-2).reverse().map(m => ({ from: m.from, to: m.to, color: m.color }))

  // ── ONLINE MODE ────────────────────────────────────────────────────────────
  // Hands off entirely to OnlinePlay, which owns its own connect/seek/game
  // screens. Selecting "Back" there returns here with mode reset to 'ai'.
  if (mode === 'online') {
    return <Suspense fallback={null}><OnlinePlay onBack={() => navigateMode('ai')} onNavigate={navigateMode} /></Suspense>
  }

  if (mode === 'puzzle') {
    return <Suspense fallback={null}><PuzzleMode onBack={() => navigateMode('ai')} onNavigate={navigateMode} /></Suspense>
  }

  if (mode === 'profile') return <Suspense fallback={null}><PlayerProfile onBack={() => navigateMode('ai')} onNavigate={navigateMode} /></Suspense>

  // ── SETUP ──────────────────────────────────────────────────────────────────
  const sideLabel = sideChoice === 'w' ? 'White' : sideChoice === 'b' ? 'Black' : 'Random side'
  const beginGame = () => start(sideChoice === 'random' ? (Math.random() < 0.5 ? 'w' : 'b') : sideChoice)

  if (setupOpen) return (
    <HomeFrame
      mode="ai"
      onNavigate={navigateMode}
      kicker="New game"
      title="Set your opponent"
      copy="Choose a playing school and strength before the board opens."
      actions={
        <>
          <p className="home-summary" aria-live="polite">
            <span>{schools[school].label}</span><i aria-hidden="true" />
            <span>{difficulty}</span><i aria-hidden="true" />
            <span>{sideLabel}</span>
          </p>
          <button type="button" className="begin-game" onClick={beginGame}>Begin game</button>
        </>
      }
    >
      <div className="home-grid">
        <div className="home-panel">
          <Dropdown
            label="Chess school"
            value={school}
            onChange={v => setSchool(v as ChessSchool)}
            options={Object.entries(schools).map(([id, p]) => ({ value: id, label: p.label, summary: p.summary }))}
          />
          <div className="school-weights" aria-label="School profile">
            <WeightBar label="Attack" value={w.attack} color="var(--w-attack)" />
            <WeightBar label="Focus"  value={w.focus}  color="var(--w-focus)"  />
            <WeightBar label="Defend" value={w.defend} color="var(--w-defend)" />
          </div>
        </div>

        <div className="home-panel">
          <Segmented<Difficulty>
            legend="Difficulty" name="difficulty" value={difficulty} onChange={setDifficulty}
            options={[
              { value: 'Relaxed', label: 'Relaxed' },
              { value: 'Classic', label: 'Classic' },
              { value: 'Expert',  label: 'Expert' },
            ]}
          />
          <Segmented<Color | 'random'>
            legend="Play as" name="side" value={sideChoice} onChange={setSideChoice}
            options={[
              { value: 'w',      label: 'White',  swatch: 'w' },
              { value: 'random', label: 'Random', swatch: 'r' },
              { value: 'b',      label: 'Black',  swatch: 'b' },
            ]}
          />
        </div>
      </div>
    </HomeFrame>
  )

  // ── GAME ───────────────────────────────────────────────────────────────────
  const tone = game.isGameOver() ? 'over' : game.turn() === player ? 'turn' : 'wait'
  return (
    <Suspense fallback={null}>
    <GameScreen
      exitLabel="New game"
      onExit={() => setSetupOpen(true)}
      opponent={{ name: 'Computer', meta: `${schools[school].label} · ${difficulty}`, avatar: { color: player === 'w' ? 'b' : 'w', type: 'q' } }}
      status={status}
      tone={tone}
      moves={history.map(m => m.san)}
      profileLabel="School profile"
      profile={
        <>
          <WeightBar label="Attack" value={w.attack} color="var(--w-attack)" />
          <WeightBar label="Focus"  value={w.focus}  color="var(--w-focus)"  />
          <WeightBar label="Defend" value={w.defend} color="var(--w-defend)" />
        </>
      }
      actions={
        <>
          {over && <button type="button" className="btn-ghost" onClick={() => setResultOpen(true)}>Result</button>}
          <button type="button" className="btn-ghost" onClick={() => start(player)}>Restart</button>
          <button type="button" className="btn-ghost" onClick={() => setSetupOpen(true)}>Change setup</button>
        </>
      }
      overlay={(
        <>
          {pendingPromotion && (
            <PromotionModal
              color={player}
              onPick={type => { commit(pendingPromotion.from, pendingPromotion.to, type); setPendingPromotion(null) }}
            />
          )}
          {over && resultOpen && (
            <Suspense fallback={null}>
            <GameResultDialog
              ratings={false}
              analysis={{ moves: history.map(m => `${m.from}${m.to}${m.promotion ?? ''}`), userColor: player, opponentName: 'Computer',
                result: game.isCheckmate() ? (game.turn() === player ? 'loss' : 'win') : 'draw', profileId: computerGameId(player, history.map(m => `${m.from}${m.to}${m.promotion ?? ''}`)) }}
              outcome={(game.isCheckmate() ? (game.turn() === player ? 'loss' : 'win') : 'draw') as Outcome}
              reason={game.isCheckmate() ? 'Checkmate' : game.isStalemate() ? 'Stalemate' : game.isThreefoldRepetition() ? 'Repetition' : game.isInsufficientMaterial() ? 'Insufficient material' : 'Fifty-move rule'}
              info={`${schools[school].label} · ${difficulty}`}
              rated={false}
              me={{ name: 'You', avatar: { color: player, type: 'p' } }}
              opp={{ name: 'Computer', avatar: { color: player === 'w' ? 'b' : 'w', type: 'q' } }}
              ratingsPending={false}
              canRematch
              rematch="idle"
              incomingRematch={false}
              rematchLabel="Play again"
              newGameLabel="Change setup"
              onRematch={() => start(player)}
              onCancelRematch={() => {}}
              onAcceptRematch={() => {}}
              onDeclineRematch={() => {}}
              onGrantPermission={() => {}}
              onNewGame={() => { setResultOpen(false); setSetupOpen(true) }}
              onHome={() => { setResultOpen(false); setSetupOpen(true) }}
              onClose={() => setResultOpen(false)}
            />
            </Suspense>
          )}
        </>
      )}
    >
      <ChessBoard
        boardRef={boardDomRef}
        getLegalTargets={square => game.moves({ square, verbose: true }).map(move => move.to)}
        onDropMove={(from, to) => {
          const moving = gameRef.current.get(from)
          if (moving?.type === 'p' && (to.endsWith('8') || to.endsWith('1'))) setPendingPromotion({ from, to })
          else commit(from, to)
        }}
        board={game.board()}
        onSquareClick={clickSquare}
        selected={selected}
        legalTargets={legalTargets}
        trail={trail}
        orientation={player}
      />
    </GameScreen>
    </Suspense>
  )
}
