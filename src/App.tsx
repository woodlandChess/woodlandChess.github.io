import { useEffect, useMemo, useRef, useState } from 'react'
import { Chess, type Color, type Move, type Square } from 'chess.js'
import { gameStatus, schoolWeights, type Difficulty } from './engine'
import { schoolBookMove, schools, StockfishClient, type ChessSchool } from './stockfish'

// ── cburnett SVG pieces · Wikimedia Commons (CC BY-SA 3.0) ──────────────────
const PIECE_SVGS: Record<Color, Record<string, string>> = {
  w: {
    k: 'https://upload.wikimedia.org/wikipedia/commons/4/42/Chess_klt45.svg',
    q: 'https://upload.wikimedia.org/wikipedia/commons/1/15/Chess_qlt45.svg',
    r: 'https://upload.wikimedia.org/wikipedia/commons/7/72/Chess_rlt45.svg',
    b: 'https://upload.wikimedia.org/wikipedia/commons/b/b1/Chess_blt45.svg',
    n: 'https://upload.wikimedia.org/wikipedia/commons/7/70/Chess_nlt45.svg',
    p: 'https://upload.wikimedia.org/wikipedia/commons/4/45/Chess_plt45.svg',
  },
  b: {
    k: 'https://upload.wikimedia.org/wikipedia/commons/f/f0/Chess_kdt45.svg',
    q: 'https://upload.wikimedia.org/wikipedia/commons/4/47/Chess_qdt45.svg',
    r: 'https://upload.wikimedia.org/wikipedia/commons/f/ff/Chess_rdt45.svg',
    b: 'https://upload.wikimedia.org/wikipedia/commons/9/98/Chess_bdt45.svg',
    n: 'https://upload.wikimedia.org/wikipedia/commons/e/ef/Chess_ndt45.svg',
    p: 'https://upload.wikimedia.org/wikipedia/commons/c/c7/Chess_pdt45.svg',
  },
}

const files = ['a','b','c','d','e','f','g','h']
const ranks = ['8','7','6','5','4','3','2','1']
const squareName = (f: string, r: string) => `${f}${r}` as Square

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

// ── App ───────────────────────────────────────────────────────────────────────
export function App() {
  const gameRef   = useRef(new Chess())
  const engineRef = useRef<StockfishClient | null>(null)
  const [fen,              setFen]              = useState(gameRef.current.fen())
  const [history,          setHistory]          = useState<Move[]>([])
  const [selected,         setSelected]         = useState<Square | null>(null)
  const [difficulty,       setDifficulty]       = useState<Difficulty>('Classic')
  const [school,           setSchool]           = useState<ChessSchool>('Universal')
  const [player,           setPlayer]           = useState<Color>('w')
  const [setupOpen,        setSetupOpen]        = useState(true)
  const [pendingPromotion, setPendingPromotion] = useState<{ from: Square; to: Square } | null>(null)

  const game         = useMemo(() => new Chess(fen), [fen])
  const legalTargets = selected ? game.moves({ square: selected, verbose: true }).map(m => m.to) : []
  const status       = gameStatus(game, player)
  const w            = schools[school].weights
  const sw           = schoolWeights[school] ?? schoolWeights.Universal

  // silence unused-var warning — sw is kept for future α–β integration
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

  // ── SETUP ──────────────────────────────────────────────────────────────────
  if (setupOpen) return (
    <main className="setup-shell">
      <section className="setup-card" aria-labelledby="setup-title">
        {/* Brand */}
        <div className="brand">
          <span className="brand-mark">♞</span>
          <span className="brand-name">Woodland Chess</span>
        </div>

        {/* Heading */}
        <div className="setup-heading">
          <span className="setup-kicker">New game</span>
          <h1 id="setup-title">Set your opponent</h1>
        </div>

        <p className="setup-copy">Choose a playing school and strength before the board opens.</p>

        {/* School selector */}
        <Dropdown
          label="Chess school"
          value={school}
          onChange={v => setSchool(v as ChessSchool)}
          options={Object.entries(schools).map(([id, p]) => ({ value: id, label: p.label, summary: p.summary }))}
        />

        {/* Weight bars */}
        <div className="school-weights">
          <WeightBar label="Attack" value={w.attack} color="var(--w-attack)" />
          <WeightBar label="Focus"  value={w.focus}  color="var(--w-focus)"  />
          <WeightBar label="Defend" value={w.defend} color="var(--w-defend)" />
        </div>

        {/* Difficulty */}
        <Dropdown
          label="Difficulty"
          value={difficulty}
          onChange={v => setDifficulty(v as Difficulty)}
          options={['Relaxed', 'Classic', 'Expert'].map(d => ({ value: d, label: d }))}
        />

        {/* Play as */}
        <fieldset className="color-picker">
          <legend>Play as</legend>
          <div className="color-picker-btns">
            <button type="button" aria-pressed={player === 'w'} onClick={() => setPlayer('w')}>♔ White</button>
            <button type="button" aria-pressed={player === 'b'} onClick={() => setPlayer('b')}>♚ Black</button>
          </div>
        </fieldset>

        <button className="begin-game" onClick={() => start(player)}>Begin game</button>
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
        {/* Board */}
        <div className="board-wrap">
          <div className="board" role="grid" aria-label="Chess board">
            {ranks.flatMap((rank, row) =>
              files.map((file, col) => {
                const square = squareName(file, rank)
                const piece  = game.get(square)
                const dark   = (row + col) % 2 === 1
                const isLast = last?.from === square || last?.to === square
                return (
                  <button
                    key={square}
                    role="gridcell"
                    aria-label={`${square}${piece ? ` ${piece.color === 'w' ? 'white' : 'black'} ${piece.type}` : ''}`}
                    className={['square', dark ? 'dark' : 'light', selected === square ? 'selected' : '', isLast ? 'last' : ''].filter(Boolean).join(' ')}
                    onClick={() => clickSquare(square)}
                  >
                    {col === 0 && <small className="rank">{rank}</small>}
                    {row === 7 && <small className="file">{file}</small>}
                    {piece && (
                      <img
                        className={`piece-svg piece-svg--${piece.color}`}
                        src={PIECE_SVGS[piece.color][piece.type]}
                        alt={`${piece.color === 'w' ? 'white' : 'black'} ${piece.type}`}
                        draggable={false}
                      />
                    )}
                    {legalTargets.includes(square) && (
                      <span className={piece ? 'capture' : 'target'} />
                    )}
                  </button>
                )
              })
            )}
          </div>
        </div>

        {/* Sidebar */}
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

          {/* School weight bars */}
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

      {/* Promotion modal */}
      {pendingPromotion && (
        <div className="modal-backdrop">
          <section className="promotion" role="dialog" aria-modal="true" aria-label="Choose promotion piece">
            <h2>Promote pawn</h2>
            <div className="promotion-pieces">
              {(['q','r','b','n'] as const).map(type => (
                <button key={type} onClick={() => { commit(pendingPromotion.from, pendingPromotion.to, type); setPendingPromotion(null) }}>
                  <img
                    src={PIECE_SVGS[player][type]}
                    alt={`${player === 'w' ? 'white' : 'black'} ${type}`}
                    className={`promo-piece-svg promo-piece-svg--${player}`}
                  />
                </button>
              ))}
            </div>
          </section>
        </div>
      )}
    </main>
  )
}
