import { useEffect, useMemo, useRef, useState } from 'react'
import { Chess, type Color, type Move, type Square } from 'chess.js'
import { gameStatus, schoolWeights, type Difficulty } from './engine'
import { schoolBookMove, schools, StockfishClient, type ChessSchool } from './stockfish'
import { ChessBoard, PromotionModal } from './ChessBoard'
import { OnlinePlay } from './OnlinePlay'
import { PuzzleMode } from './puzzle/PuzzleMode'
import { IconComputer, IconOnline, IconPuzzle } from './components/ModeIcons'

// ── Weight bar ────────────────────────────────────────────────────────────────
function WeightBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="weight-bar-row">
      <span className="weight-label">{label}</span>
      <div className="weight-track">
        <div className="weight-fill" style={{ width: `${value * 10}%`, background: color }} />
      </div>
      <span className="weight-value">{value}</span>
    </div>
  )
}

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

// ── Segmented control (native radios: free arrow-key + screen-reader support) ──
type SegOption<T extends string> = { value: T; label: string; swatch?: 'w' | 'b' | 'r' }

function Segmented<T extends string>({ legend, name, value, options, onChange }: {
  legend: string; name: string; value: T; options: SegOption<T>[]
  onChange: (v: T) => void
}) {
  return (
    <fieldset className="field">
      <legend className="field-label">{legend}</legend>
      <div className="seg" style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}>
        {options.map(o => (
          <label key={o.value} className="seg-opt">
            <input type="radio" name={name} value={o.value} checked={o.value === value}
              onChange={() => onChange(o.value)} />
            <span className="seg-face">
              {o.swatch && <i className={`seg-swatch seg-swatch--${o.swatch}`} aria-hidden="true" />}
              {o.label}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}

// ── Mode navigation ───────────────────────────────────────────────────────────
type ModeId = 'ai' | 'online' | 'puzzle'
const modeItems: { id: ModeId; label: string; Icon: typeof IconComputer }[] = [
  { id: 'ai',     label: 'Computer',    Icon: IconComputer },
  { id: 'online', label: 'Play online', Icon: IconOnline },
  { id: 'puzzle', label: 'Puzzles',     Icon: IconPuzzle },
]

function ModeNav({ current, onSelect }: { current: ModeId; onSelect: (m: ModeId) => void }) {
  return (
    <nav className="mode-nav" aria-label="Game mode">
      {modeItems.map(({ id, label, Icon }) => (
        <button key={id} type="button" className="mode-nav-btn"
          aria-current={id === current ? 'page' : undefined}
          onClick={() => { if (id !== current) onSelect(id) }}>
          <Icon className="mode-nav-icon" />
          <span>{label}</span>
        </button>
      ))}
    </nav>
  )
}

// ── App ───────────────────────────────────────────────────────────────────────
export function App() {
  type Mode = ModeId
  const modeFromPath = (path: string): Mode => path.replace(/\/$/, '') === '/puzzle' ? 'puzzle' : path.replace(/\/$/, '') === '/multiplayer' ? 'online' : 'ai'
  const pathForMode = (next: Mode) => next === 'puzzle' ? '/puzzle' : next === 'online' ? '/multiplayer' : '/ai'
  const [mode, setMode] = useState<Mode>(() => {
    if (new URLSearchParams(window.location.search).has('code') && sessionStorage.getItem('woodland-chess:oauth-return-path') === '/multiplayer') return 'online'
    return modeFromPath(window.location.pathname)
  })

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
  const [history,          setHistory]          = useState<Move[]>([])
  const [selected,         setSelected]         = useState<Square | null>(null)
  const [difficulty,       setDifficulty]       = useState<Difficulty>('Classic')
  const [school,           setSchool]           = useState<ChessSchool>('Universal')
  const [player,           setPlayer]           = useState<Color>('w')
  const [sideChoice,       setSideChoice]       = useState<Color | 'random'>('w')
  const [setupOpen,        setSetupOpen]        = useState(true)
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
    setFen(gameRef.current.fen())
    setHistory(gameRef.current.history({ verbose: true }))
    setSelected(null)
  }

  const start = (side: Color = player) => {
    gameRef.current = new Chess()
    setPlayer(side)
    setFen(gameRef.current.fen())
    setHistory([])
    setSelected(null)
    setPendingPromotion(null)
    setSetupOpen(false)
  }

  const commit = (from: Square, to: Square, promotion = 'q') => {
    try { gameRef.current.move({ from, to, promotion }); sync() } catch { return }
  }

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
      if (!uci || current !== gameRef.current || current.isGameOver()) return
      try {
        gameRef.current.move({ from: uci.slice(0,2) as Square, to: uci.slice(2,4) as Square, promotion: uci[4] })
        sync()
      } catch { /* discard stale */ }
    }, 80)
    return () => window.clearTimeout(timer)
  }, [fen, player, difficulty, school, pendingPromotion, setupOpen])

  const last = history.at(-1)

  // ── ONLINE MODE ────────────────────────────────────────────────────────────
  // Hands off entirely to OnlinePlay, which owns its own connect/seek/game
  // screens. Selecting "Back" there returns here with mode reset to 'ai'.
  if (mode === 'online') {
    return <OnlinePlay onBack={() => navigateMode('ai')} />
  }

  if (mode === 'puzzle') {
    return <PuzzleMode onBack={() => navigateMode('ai')} />
  }

  // ── SETUP ──────────────────────────────────────────────────────────────────
  const sideLabel = sideChoice === 'w' ? 'White' : sideChoice === 'b' ? 'Black' : 'Random side'
  const beginGame = () => start(sideChoice === 'random' ? (Math.random() < 0.5 ? 'w' : 'b') : sideChoice)

  if (setupOpen) return (
    <main className="setup-shell setup-shell--home">
      <section className="setup-card setup-card--home" aria-labelledby="setup-title">
        <div className="home-head">
          <div className="brand">
            <span className="brand-mark">♞</span>
            <span className="brand-name">Woodland Chess</span>
          </div>
          <ModeNav current="ai" onSelect={navigateMode} />
        </div>

        <div className="home-intro">
          <span className="setup-kicker">New game</span>
          <h1 id="setup-title">Set your opponent</h1>
          <p className="setup-copy">Choose a playing school and strength before the board opens.</p>
        </div>

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

        <div className="home-actions">
          <p className="home-summary" aria-live="polite">
            <span>{schools[school].label}</span><i aria-hidden="true" />
            <span>{difficulty}</span><i aria-hidden="true" />
            <span>{sideLabel}</span>
          </p>
          <button type="button" className="begin-game" onClick={beginGame}>Begin game</button>
        </div>
      </section>
    </main>
  )

  // ── GAME ───────────────────────────────────────────────────────────────────
  return (
    <main className="app-shell">
      <header>
        <div className="brand">
          <span className="brand-mark">♞</span>
          <span className="brand-name">Woodland Chess</span>
        </div>
        <button className="new-game" onClick={() => setSetupOpen(true)}>New game</button>
      </header>

      <section className="game-layout">
        <div className="board-wrap">
          <ChessBoard
            board={game.board()}
            onSquareClick={clickSquare}
            selected={selected}
            legalTargets={legalTargets}
            lastFrom={last?.from}
            lastTo={last?.to}
            orientation={player}
          />
        </div>

        <aside className="sidebar">
          <div className="sidebar-section">
            <div className="opponent">
              <div className="avatar">♛</div>
              <div className="opponent-info">
                <strong>Computer</strong>
                <span>{schools[school].label} · {difficulty}</span>
              </div>
            </div>
          </div>
          <div className="sidebar-section sidebar-weights">
            <span className="status-label">School profile</span>
            <WeightBar label="Attack" value={w.attack} color="var(--w-attack)" />
            <WeightBar label="Focus"  value={w.focus}  color="var(--w-focus)"  />
            <WeightBar label="Defend" value={w.defend} color="var(--w-defend)" />
          </div>
          <div className="sidebar-section">
            <span className="status-label">Position</span>
            <div className="status" aria-live="polite">{status}</div>
          </div>
          <div className="sidebar-section history-section">
            <p className="history-head">Moves</p>
            <div className="history" aria-label="Move history">
              {history.length === 0
                ? <p>Opening position</p>
                : Array.from({ length: Math.ceil(history.length / 2) }, (_, i) => (
                    <div className="move-row" key={i}>
                      <span>{i + 1}.</span>
                      <span>{history[i * 2]?.san}</span>
                      <span>{history[i * 2 + 1]?.san ?? ''}</span>
                    </div>
                  ))
              }
            </div>
          </div>
          <button className="resign" onClick={() => setSetupOpen(true)}>Change setup</button>
        </aside>
      </section>

      {pendingPromotion && (
        <PromotionModal
          color={player}
          onPick={type => { commit(pendingPromotion.from, pendingPromotion.to, type); setPendingPromotion(null) }}
        />
      )}
    </main>
  )
}
