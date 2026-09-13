import { useEffect, useMemo, useRef, useState } from 'react'
import { Chess, type Color, type Move, type Square } from 'chess.js'
import { gameStatus, schoolWeights, type Difficulty } from './engine'
import { schoolBookMove, schools, StockfishClient, type ChessSchool } from './stockfish'

// ── Custom chess piece SVGs ──────────────────────────────────────────────────
// These are self-contained SVG paths designed to:
//   1. Be identical in stroke weight between white and black sets (fixes thickness issue)
//   2. Use a neutral mid-gray (#808080) base so CSS hue-shift filters land
//      predictably on both sides without black (#000) or pure white (#fff)
//      extremes interfering
//   3. Carry no fills that match the board colors (eliminates "invisible on dark" issue)
//
// Color mapping via CSS filter (see styles.css):
//   White pieces → warm ivory #e6e3da  (brand --text)
//   Black pieces → cool steel #9aa3a8  (brand --text-2), clearly distinct from white
//
// SVG anatomy: all pieces share a 45×45 viewBox matching the cburnett grid.
// Each SVG is a data URI injected as <img src=...> — no external network needed.

// Shared piece drawing utilities
const makeDataUri = (svgBody: string) =>
  `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45">${svgBody}</svg>`
  )}`

// All pieces use fill="#808080" stroke="#808080" as the base neutral —
// CSS filters shift this to ivory (white pieces) or steel (black pieces).
// stroke-linejoin and stroke-linecap are set consistently so both sides look identical.

const PIECE_SVGS_RAW: Record<Color, Record<string, string>> = {
  w: {
    // ── PAWN ──────────────────────────────────────────────────────────────────
    p: makeDataUri(`
      <g fill="#808080" stroke="#808080" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round">
        <circle cx="22.5" cy="10" r="4.5"/>
        <path d="M 22.5 15.5 C 19 15.5 16 17.5 16 20 C 16 22.5 17.5 24 19 25.5 L 15 31.5 C 13 31.5 11 32.5 11 34 L 34 34 C 34 32.5 32 31.5 30 31.5 L 26 25.5 C 27.5 24 29 22.5 29 20 C 29 17.5 26 15.5 22.5 15.5 Z"/>
        <line x1="11" y1="34" x2="34" y2="34" stroke-width="1.5"/>
        <line x1="10" y1="37" x2="35" y2="37" stroke-width="1.5"/>
      </g>
    `),
    // ── KNIGHT ────────────────────────────────────────────────────────────────
    n: makeDataUri(`
      <g fill="#808080" stroke="#808080" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round">
        <path d="M 22 10 C 32.5 11 38.5 23 33 30 C 37.5 27 39.5 24.5 38 18 C 36.5 12 32 9 28 8 C 25 7 22.5 8 22 10 Z"/>
        <path d="M 22 10 C 20 11 16 13 14 18 C 12 23 12 27 16 33 C 20 39 26.5 41 29 38 C 31.5 35 30 30 30 30 C 30 28 31 27 33 30 C 35 33 35 37 33.5 40 C 32 43 26 44 23 43 C 17 42 12 37 9 32 C 7 27 8 21 11 17 C 14 13 18 10.5 22 10 Z"/>
        <circle cx="24" cy="15" r="1.5"/>
        <path d="M 14 25 C 14 25 16 20 18 18 C 20 16 22 17 22 17" stroke-width="1" fill="none"/>
        <line x1="9.5" y1="38" x2="34.5" y2="38" stroke-width="1.5"/>
        <line x1="9" y1="40" x2="35" y2="40" stroke-width="1.5"/>
      </g>
    `),
    // ── BISHOP ────────────────────────────────────────────────────────────────
    b: makeDataUri(`
      <g fill="#808080" stroke="#808080" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round">
        <circle cx="22.5" cy="8" r="2.75"/>
        <path d="M 22.5 10.5 C 19 12 16 15.5 16 19.5 C 16 23.5 17.5 26 20 28.5 L 14 34 C 14 34 11.5 36 13 37.5 C 15 39 32 39 34 37.5 C 35.5 36 33 34 33 34 L 27 28.5 C 29.5 26 31 23.5 31 19.5 C 31 15.5 28 12 24.5 10.5 Z"/>
        <line x1="14" y1="34" x2="31" y2="34" stroke-width="1.5"/>
        <line x1="11" y1="37.5" x2="34" y2="37.5" stroke-width="1.5"/>
        <line x1="22.5" y1="10.5" x2="22.5" y2="19.5" stroke-width="1" fill="none"/>
      </g>
    `),
    // ── ROOK ──────────────────────────────────────────────────────────────────
    r: makeDataUri(`
      <g fill="#808080" stroke="#808080" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round">
        <path d="M 9 39 L 36 39 L 36 35 L 9 35 Z"/>
        <path d="M 12 35 L 12 12 L 17 12 L 17 16 L 21 16 L 21 12 L 24 12 L 24 16 L 28 16 L 28 12 L 33 12 L 33 35 Z"/>
        <path d="M 9 12 L 9 8 L 14 8 L 14 12 Z"/>
        <path d="M 31 12 L 31 8 L 36 8 L 36 12 Z"/>
        <path d="M 14 12 L 17 12"/>
        <path d="M 28 12 L 31 12"/>
        <line x1="9" y1="39" x2="36" y2="39" stroke-width="1.5"/>
      </g>
    `),
    // ── QUEEN ─────────────────────────────────────────────────────────────────
    q: makeDataUri(`
      <g fill="#808080" stroke="#808080" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round">
        <circle cx="6" cy="12" r="2.75"/>
        <circle cx="14" cy="9" r="2.75"/>
        <circle cx="22.5" cy="8" r="2.75"/>
        <circle cx="31" cy="9" r="2.75"/>
        <circle cx="39" cy="12" r="2.75"/>
        <path d="M 9 26 C 17.5 24.5 27 24.5 36 26 L 38.5 13.5 L 31 25 L 30.7 10.9 L 22.5 24.5 L 14.3 10.9 L 14 25 L 6.5 13.5 Z" stroke-linecap="butt"/>
        <path d="M 9 26 C 9 28 10.5 28 11.5 30 C 12.5 31.5 12.5 31 12 33.5 C 10.5 34.5 10.5 36 10.5 36 C 10.5 37.5 11.5 38.5 22.5 38.5 C 33.5 38.5 34.5 37.5 34.5 36 C 34.5 36 34.5 34.5 33 33.5 C 32.5 31 32.5 31.5 33.5 30 C 34.5 28 36 28 36 26 C 27.5 24.5 17.5 24.5 9 26 Z"/>
        <line x1="11.5" y1="30" x2="33.5" y2="30" stroke-width="1.5"/>
        <line x1="12" y1="33.5" x2="33" y2="33.5" stroke-width="1.5"/>
        <line x1="10.5" y1="36" x2="34.5" y2="36" stroke-width="1.5"/>
      </g>
    `),
    // ── KING ──────────────────────────────────────────────────────────────────
    k: makeDataUri(`
      <g fill="#808080" stroke="#808080" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round">
        <path d="M 22.5 11.63 L 22.5 6"/>
        <path d="M 20 8 L 25 8"/>
        <path d="M 22.5 25 C 22.5 25 27 17.5 25.5 14.5 C 25.5 14.5 24.5 12 22.5 12 C 20.5 12 19.5 14.5 19.5 14.5 C 18 17.5 22.5 25 22.5 25" stroke-linejoin="miter"/>
        <path d="M 11.5 37 C 17 40.5 27 40.5 32.5 37 L 32.5 30 C 32.5 30 41.5 25.5 38.5 19.5 C 34.5 13 25 16 22.5 23.5 L 22.5 27 L 22.5 23.5 C 20 16 10.5 13 6.5 19.5 C 3.5 25.5 12.5 30 12.5 30 Z"/>
        <line x1="11.5" y1="30" x2="32.5" y2="30" stroke-width="1.5"/>
        <line x1="11.5" y1="33.5" x2="32.5" y2="33.5" stroke-width="1.5"/>
        <line x1="11.5" y1="37" x2="32.5" y2="37" stroke-width="1.5"/>
      </g>
    `),
  },
  b: {
    // Black pieces use identical SVG paths — color differentiation is done
    // entirely via CSS filter, not different SVG files/paths.
    // This guarantees pixel-perfect shape parity: same stroke-width, same paths.
    p: makeDataUri(`
      <g fill="#808080" stroke="#808080" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round">
        <circle cx="22.5" cy="10" r="4.5"/>
        <path d="M 22.5 15.5 C 19 15.5 16 17.5 16 20 C 16 22.5 17.5 24 19 25.5 L 15 31.5 C 13 31.5 11 32.5 11 34 L 34 34 C 34 32.5 32 31.5 30 31.5 L 26 25.5 C 27.5 24 29 22.5 29 20 C 29 17.5 26 15.5 22.5 15.5 Z"/>
        <line x1="11" y1="34" x2="34" y2="34" stroke-width="1.5"/>
        <line x1="10" y1="37" x2="35" y2="37" stroke-width="1.5"/>
      </g>
    `),
    n: makeDataUri(`
      <g fill="#808080" stroke="#808080" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round">
        <path d="M 22 10 C 32.5 11 38.5 23 33 30 C 37.5 27 39.5 24.5 38 18 C 36.5 12 32 9 28 8 C 25 7 22.5 8 22 10 Z"/>
        <path d="M 22 10 C 20 11 16 13 14 18 C 12 23 12 27 16 33 C 20 39 26.5 41 29 38 C 31.5 35 30 30 30 30 C 30 28 31 27 33 30 C 35 33 35 37 33.5 40 C 32 43 26 44 23 43 C 17 42 12 37 9 32 C 7 27 8 21 11 17 C 14 13 18 10.5 22 10 Z"/>
        <circle cx="24" cy="15" r="1.5"/>
        <path d="M 14 25 C 14 25 16 20 18 18 C 20 16 22 17 22 17" stroke-width="1" fill="none"/>
        <line x1="9.5" y1="38" x2="34.5" y2="38" stroke-width="1.5"/>
        <line x1="9" y1="40" x2="35" y2="40" stroke-width="1.5"/>
      </g>
    `),
    b: makeDataUri(`
      <g fill="#808080" stroke="#808080" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round">
        <circle cx="22.5" cy="8" r="2.75"/>
        <path d="M 22.5 10.5 C 19 12 16 15.5 16 19.5 C 16 23.5 17.5 26 20 28.5 L 14 34 C 14 34 11.5 36 13 37.5 C 15 39 32 39 34 37.5 C 35.5 36 33 34 33 34 L 27 28.5 C 29.5 26 31 23.5 31 19.5 C 31 15.5 28 12 24.5 10.5 Z"/>
        <line x1="14" y1="34" x2="31" y2="34" stroke-width="1.5"/>
        <line x1="11" y1="37.5" x2="34" y2="37.5" stroke-width="1.5"/>
        <line x1="22.5" y1="10.5" x2="22.5" y2="19.5" stroke-width="1" fill="none"/>
      </g>
    `),
    r: makeDataUri(`
      <g fill="#808080" stroke="#808080" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round">
        <path d="M 9 39 L 36 39 L 36 35 L 9 35 Z"/>
        <path d="M 12 35 L 12 12 L 17 12 L 17 16 L 21 16 L 21 12 L 24 12 L 24 16 L 28 16 L 28 12 L 33 12 L 33 35 Z"/>
        <path d="M 9 12 L 9 8 L 14 8 L 14 12 Z"/>
        <path d="M 31 12 L 31 8 L 36 8 L 36 12 Z"/>
        <path d="M 14 12 L 17 12"/>
        <path d="M 28 12 L 31 12"/>
        <line x1="9" y1="39" x2="36" y2="39" stroke-width="1.5"/>
      </g>
    `),
    q: makeDataUri(`
      <g fill="#808080" stroke="#808080" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round">
        <circle cx="6" cy="12" r="2.75"/>
        <circle cx="14" cy="9" r="2.75"/>
        <circle cx="22.5" cy="8" r="2.75"/>
        <circle cx="31" cy="9" r="2.75"/>
        <circle cx="39" cy="12" r="2.75"/>
        <path d="M 9 26 C 17.5 24.5 27 24.5 36 26 L 38.5 13.5 L 31 25 L 30.7 10.9 L 22.5 24.5 L 14.3 10.9 L 14 25 L 6.5 13.5 Z" stroke-linecap="butt"/>
        <path d="M 9 26 C 9 28 10.5 28 11.5 30 C 12.5 31.5 12.5 31 12 33.5 C 10.5 34.5 10.5 36 10.5 36 C 10.5 37.5 11.5 38.5 22.5 38.5 C 33.5 38.5 34.5 37.5 34.5 36 C 34.5 36 34.5 34.5 33 33.5 C 32.5 31 32.5 31.5 33.5 30 C 34.5 28 36 28 36 26 C 27.5 24.5 17.5 24.5 9 26 Z"/>
        <line x1="11.5" y1="30" x2="33.5" y2="30" stroke-width="1.5"/>
        <line x1="12" y1="33.5" x2="33" y2="33.5" stroke-width="1.5"/>
        <line x1="10.5" y1="36" x2="34.5" y2="36" stroke-width="1.5"/>
      </g>
    `),
    k: makeDataUri(`
      <g fill="#808080" stroke="#808080" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round">
        <path d="M 22.5 11.63 L 22.5 6"/>
        <path d="M 20 8 L 25 8"/>
        <path d="M 22.5 25 C 22.5 25 27 17.5 25.5 14.5 C 25.5 14.5 24.5 12 22.5 12 C 20.5 12 19.5 14.5 19.5 14.5 C 18 17.5 22.5 25 22.5 25" stroke-linejoin="miter"/>
        <path d="M 11.5 37 C 17 40.5 27 40.5 32.5 37 L 32.5 30 C 32.5 30 41.5 25.5 38.5 19.5 C 34.5 13 25 16 22.5 23.5 L 22.5 27 L 22.5 23.5 C 20 16 10.5 13 6.5 19.5 C 3.5 25.5 12.5 30 12.5 30 Z"/>
        <line x1="11.5" y1="30" x2="32.5" y2="30" stroke-width="1.5"/>
        <line x1="11.5" y1="33.5" x2="32.5" y2="33.5" stroke-width="1.5"/>
        <line x1="11.5" y1="37" x2="32.5" y2="37" stroke-width="1.5"/>
      </g>
    `),
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
                        src={PIECE_SVGS_RAW[piece.color][piece.type]}
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
                    src={PIECE_SVGS_RAW[player][type]}
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
