import { useEffect, useMemo, useRef, useState } from 'react'
import { Chess, type Color, type Move, type Square } from 'chess.js'
import { gameStatus, schoolWeights, type Difficulty } from './engine'
import { schoolBookMove, schools, StockfishClient, type ChessSchool } from './stockfish'
// ── Chess piece SVGs ─────────────────────────────────────────────────────────
//
// Paths sourced from the cburnett set (Colin M.L. Burnett, CC BY-SA 3.0),
// the same set used by Lichess, python-chess, and Wikipedia. Paths are
// extracted from python-chess/chess/svg.py (the authoritative text-format
// source) so every shape is pixel-faithful to the original.
//
// Design decisions for this dark-themed board:
//
//  1. SINGLE NEUTRAL BASE — all paths are recoloured to #808080 (L*53,
//     neutral gray). Both sides share identical path data; colour comes
//     entirely from CSS filter (see styles.css). This eliminates the
//     stroke-weight mismatch that existed when white/black used separate
//     original SVG files with different rendering conventions.
//
//  2. DETAIL COLOUR — inner lines, eyes, nostril (things that should read
//     as recesses) are set to #505050 (L*34) so after the brightness filter
//     they stay relatively darker than the body, preserving depth cues on
//     both ivory-white and steel-gray pieces.
//
//  3. FILTER APPROACH (defined in styles.css):
//       White pieces → warm ivory  #e6e3da  (brand --text, L*90)
//                      brightness(2.0) sepia(0.10) saturate(0.9)
//       Black pieces → cool steel  #9aa3a8  (brand --text-2, L*66)
//                      brightness(1.28) hue-rotate(196deg) saturate(0.72)
//
// Accessibility (WCAG non-text contrast ≥ 3:1):
//   Ivory  #e6e3da vs light sq #1a2027 → ~11:1  ✓ AAA
//   Ivory  #e6e3da vs dark sq  #0d1013 → ~16:1  ✓ AAA
//   Steel  #9aa3a8 vs light sq #1a2027 → ~4.8:1 ✓ AA+
//   Steel  #9aa3a8 vs dark sq  #0d1013 → ~6.6:1 ✓ AA+
// ─────────────────────────────────────────────────────────────────────────────

const B = '#808080'   // body fill + stroke
const D = '#505050'   // detail (eyes, inner lines) — stays relatively dark after filter

// All pieces use a 45×45 viewBox, encoded as data URIs so no network calls
// are needed and the browser can apply CSS filter directly.
const svg = (body: string) =>
  `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45">${body}</svg>`
  )}`

const PIECE_SVGS: Record<Color, Record<string, string>> = {
  w: {
    // ── PAWN ────────────────────────────────────────────────────────────────
    // cburnett white pawn path (Chess_plt45.svg), fill rebound to neutral
    p: svg(`<g fill="${B}" stroke="${B}" stroke-width="1.5" stroke-linecap="round">
      <path d="M22.5 9c-2.21 0-4 1.79-4 4 0 .89.29 1.71.78 2.38C17.33 16.5 16 18.59 16 21c0 2.03.94 3.84 2.41 5.03-3 1.06-7.41 5.55-7.41 13.47h23c0-7.92-4.41-12.41-7.41-13.47 1.47-1.19 2.41-3 2.41-5.03 0-2.41-1.33-4.5-3.28-5.62.49-.67.78-1.49.78-2.38 0-2.21-1.79-4-4-4z"/>
    </g>`),

    // ── KNIGHT ──────────────────────────────────────────────────────────────
    // Exact cburnett knight paths from python-chess/chess/svg.py — the
    // authoritative source used by Lichess and Wikipedia. The horse faces
    // LEFT. Two filled regions (body + face/snout) plus eye + nostril dots.
    n: svg(`<g fill="none" fill-rule="evenodd" stroke="${B}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M 22,10 C 32.5,11 38.5,18 38,39 L 15,39 C 15,30 25,32.5 23,18" fill="${B}"/>
      <path d="M 24,18 C 24.38,20.91 18.45,25.37 16,27 C 13,29 13.18,31.34 11,31 C 9.958,30.06 12.41,27.96 11,28 C 10,28 11.19,29.23 10,30 C 9,30 5.997,31 6,26 C 6,24 12,14 12,14 C 12,14 13.89,12.1 14,10.5 C 13.27,9.506 13.5,8.5 13.5,7.5 C 14.5,6.5 16.5,10 16.5,10 L 18.5,10 C 18.5,10 19.28,8.008 21,7 C 22,7 22,10 22,10" fill="${B}"/>
      <path d="M 9.5 25.5 A 0.5 0.5 0 1 1 8.5,25.5 A 0.5 0.5 0 1 1 9.5 25.5 z" fill="${D}" stroke="${D}"/>
      <path d="M 15 15.5 A 0.5 1.5 0 1 1 14,15.5 A 0.5 1.5 0 1 1 15 15.5 z" transform="matrix(0.866,0.5,-0.5,0.866,9.693,-5.173)" fill="${D}" stroke="${D}"/>
    </g>`),

    // ── BISHOP ──────────────────────────────────────────────────────────────
    b: svg(`<g fill="none" fill-rule="evenodd" stroke="${B}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <g fill="${B}" stroke-linecap="butt">
        <path d="M9 36c3.39-.97 10.11.43 13.5-2 3.39 2.43 10.11 1.03 13.5 2 0 0 1.65.54 3 2-.68.97-1.65.99-3 .5-3.39-.97-10.11.46-13.5-1-3.39 1.46-10.11.03-13.5 1-1.354.49-2.323.47-3-.5 1.354-1.94 3-2 3-2z"/>
        <path d="M15 32c2.5 2.5 12.5 2.5 15 0 .5-1.5 0-2 0-2 0-2.5-2.5-4-2.5-4 5.5-1.5 6-11.5-5-15.5-11 4-10.5 14-5 15.5 0 0-2.5 1.5-2.5 4 0 0-.5.5 0 2z"/>
        <circle cx="22.5" cy="8" r="2.5"/>
      </g>
      <path d="M17.5 26h10M15 30h15m-7.5-14.5v5M20 18h5" stroke="${D}" stroke-linejoin="miter"/>
    </g>`),

    // ── ROOK ────────────────────────────────────────────────────────────────
    r: svg(`<g fill="${B}" fill-rule="evenodd" stroke="${B}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M9 39h27v-3H9v3zM12 36v-4h21v4H12zM11 14V9h4v2h5V9h5v2h5V9h4v5" stroke-linecap="butt"/>
      <path d="M34 14l-3 3H14l-3-3"/>
      <path d="M31 17v12.5H14V17" stroke-linecap="butt" stroke-linejoin="miter"/>
      <path d="M31 29.5l1.5 2.5h-20l1.5-2.5"/>
      <path d="M11 14h23" fill="none" stroke-linejoin="miter"/>
      <path d="M12 35.5h21M13 31.5h19M14 29.5h17M14 17h17M11 14h23" fill="none" stroke="${D}" stroke-width="1"/>
    </g>`),

    // ── QUEEN ───────────────────────────────────────────────────────────────
    q: svg(`<g fill="${B}" fill-rule="evenodd" stroke="${B}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <g fill="${B}" stroke="none">
        <circle cx="6"    cy="12" r="2.75"/>
        <circle cx="14"   cy="9"  r="2.75"/>
        <circle cx="22.5" cy="8"  r="2.75"/>
        <circle cx="31"   cy="9"  r="2.75"/>
        <circle cx="39"   cy="12" r="2.75"/>
      </g>
      <path d="M9 26c8.5-1.5 21-1.5 27 0l2.5-12.5L31 25l-.3-14.1-5.2 13.6-3-14.5-3 14.5-5.2-13.6L14 25 6.5 13.5 9 26z" stroke-linecap="butt"/>
      <path d="M9 26c0 2 1.5 2 2.5 4 1 1.5 1 1 .5 3.5-1.5 1-1.5 2.5-1.5 2.5-1.5 1.5.5 2.5.5 2.5 6.5 1 16.5 1 23 0 0 0 1.5-1 0-2.5 0 0 .5-1.5-1-2.5-.5-2.5-.5-2 .5-3.5 1-2 2.5-2 2.5-4-8.5-1.5-18.5-1.5-27 0z" stroke-linecap="butt"/>
      <path d="M11 38.5a35 35 1 0 0 23 0" fill="none" stroke-linecap="butt"/>
      <path d="M11 29a35 35 1 0 1 23 0M12.5 31.5h20M11.5 34.5a35 35 1 0 0 22 0M10.5 37.5a35 35 1 0 0 24 0" fill="none" stroke="${D}"/>
    </g>`),

    // ── KING ────────────────────────────────────────────────────────────────
    k: svg(`<g fill="none" fill-rule="evenodd" stroke="${B}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M22.5 11.63V6M20 8h5" stroke-linejoin="miter"/>
      <path d="M22.5 25s4.5-7.5 3-10.5c0 0-1-2.5-3-2.5s-3 2.5-3 2.5c-1.5 3 3 10.5 3 10.5" fill="${B}" stroke-linecap="butt" stroke-linejoin="miter"/>
      <path d="M11.5 37c5.5 3.5 15.5 3.5 21 0v-7s9-4.5 6-10.5c-4-6.5-13.5-3.5-16 4V27v-3.5c-3.5-7.5-13-10.5-16-4-3 6 5 10 5 10V37z" fill="${B}"/>
      <path d="M11.5 30c5.5-3 15.5-3 21 0m-21 3.5c5.5-3 15.5-3 21 0m-21 3.5c5.5-3 15.5-3 21 0" stroke="${D}"/>
    </g>`),
  },

  // ── BLACK SIDE ─────────────────────────────────────────────────────────────
  // Identical path data to white — colour difference comes from CSS filter only.
  // This guarantees identical apparent stroke weight and silhouette at every size.
  b: {
    p: svg(`<g fill="${B}" stroke="${B}" stroke-width="1.5" stroke-linecap="round">
      <path d="M22.5 9c-2.21 0-4 1.79-4 4 0 .89.29 1.71.78 2.38C17.33 16.5 16 18.59 16 21c0 2.03.94 3.84 2.41 5.03-3 1.06-7.41 5.55-7.41 13.47h23c0-7.92-4.41-12.41-7.41-13.47 1.47-1.19 2.41-3 2.41-5.03 0-2.41-1.33-4.5-3.28-5.62.49-.67.78-1.49.78-2.38 0-2.21-1.79-4-4-4z"/>
    </g>`),

    n: svg(`<g fill="none" fill-rule="evenodd" stroke="${B}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M 22,10 C 32.5,11 38.5,18 38,39 L 15,39 C 15,30 25,32.5 23,18" fill="${B}"/>
      <path d="M 24,18 C 24.38,20.91 18.45,25.37 16,27 C 13,29 13.18,31.34 11,31 C 9.958,30.06 12.41,27.96 11,28 C 10,28 11.19,29.23 10,30 C 9,30 5.997,31 6,26 C 6,24 12,14 12,14 C 12,14 13.89,12.1 14,10.5 C 13.27,9.506 13.5,8.5 13.5,7.5 C 14.5,6.5 16.5,10 16.5,10 L 18.5,10 C 18.5,10 19.28,8.008 21,7 C 22,7 22,10 22,10" fill="${B}"/>
      <path d="M 9.5 25.5 A 0.5 0.5 0 1 1 8.5,25.5 A 0.5 0.5 0 1 1 9.5 25.5 z" fill="${D}" stroke="${D}"/>
      <path d="M 15 15.5 A 0.5 1.5 0 1 1 14,15.5 A 0.5 1.5 0 1 1 15 15.5 z" transform="matrix(0.866,0.5,-0.5,0.866,9.693,-5.173)" fill="${D}" stroke="${D}"/>
    </g>`),

    b: svg(`<g fill="none" fill-rule="evenodd" stroke="${B}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <g fill="${B}" stroke-linecap="butt">
        <path d="M9 36c3.39-.97 10.11.43 13.5-2 3.39 2.43 10.11 1.03 13.5 2 0 0 1.65.54 3 2-.68.97-1.65.99-3 .5-3.39-.97-10.11.46-13.5-1-3.39 1.46-10.11.03-13.5 1-1.354.49-2.323.47-3-.5 1.354-1.94 3-2 3-2z"/>
        <path d="M15 32c2.5 2.5 12.5 2.5 15 0 .5-1.5 0-2 0-2 0-2.5-2.5-4-2.5-4 5.5-1.5 6-11.5-5-15.5-11 4-10.5 14-5 15.5 0 0-2.5 1.5-2.5 4 0 0-.5.5 0 2z"/>
        <circle cx="22.5" cy="8" r="2.5"/>
      </g>
      <path d="M17.5 26h10M15 30h15m-7.5-14.5v5M20 18h5" stroke="${D}" stroke-linejoin="miter"/>
    </g>`),

    r: svg(`<g fill="${B}" fill-rule="evenodd" stroke="${B}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M9 39h27v-3H9v3zM12 36v-4h21v4H12zM11 14V9h4v2h5V9h5v2h5V9h4v5" stroke-linecap="butt"/>
      <path d="M34 14l-3 3H14l-3-3"/>
      <path d="M31 17v12.5H14V17" stroke-linecap="butt" stroke-linejoin="miter"/>
      <path d="M31 29.5l1.5 2.5h-20l1.5-2.5"/>
      <path d="M11 14h23" fill="none" stroke-linejoin="miter"/>
      <path d="M12 35.5h21M13 31.5h19M14 29.5h17M14 17h17M11 14h23" fill="none" stroke="${D}" stroke-width="1"/>
    </g>`),

    q: svg(`<g fill="${B}" fill-rule="evenodd" stroke="${B}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <g fill="${B}" stroke="none">
        <circle cx="6"    cy="12" r="2.75"/>
        <circle cx="14"   cy="9"  r="2.75"/>
        <circle cx="22.5" cy="8"  r="2.75"/>
        <circle cx="31"   cy="9"  r="2.75"/>
        <circle cx="39"   cy="12" r="2.75"/>
      </g>
      <path d="M9 26c8.5-1.5 21-1.5 27 0l2.5-12.5L31 25l-.3-14.1-5.2 13.6-3-14.5-3 14.5-5.2-13.6L14 25 6.5 13.5 9 26z" stroke-linecap="butt"/>
      <path d="M9 26c0 2 1.5 2 2.5 4 1 1.5 1 1 .5 3.5-1.5 1-1.5 2.5-1.5 2.5-1.5 1.5.5 2.5.5 2.5 6.5 1 16.5 1 23 0 0 0 1.5-1 0-2.5 0 0 .5-1.5-1-2.5-.5-2.5-.5-2 .5-3.5 1-2 2.5-2 2.5-4-8.5-1.5-18.5-1.5-27 0z" stroke-linecap="butt"/>
      <path d="M11 38.5a35 35 1 0 0 23 0" fill="none" stroke-linecap="butt"/>
      <path d="M11 29a35 35 1 0 1 23 0M12.5 31.5h20M11.5 34.5a35 35 1 0 0 22 0M10.5 37.5a35 35 1 0 0 24 0" fill="none" stroke="${D}"/>
    </g>`),

    k: svg(`<g fill="none" fill-rule="evenodd" stroke="${B}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M22.5 11.63V6M20 8h5" stroke-linejoin="miter"/>
      <path d="M22.5 25s4.5-7.5 3-10.5c0 0-1-2.5-3-2.5s-3 2.5-3 2.5c-1.5 3 3 10.5 3 10.5" fill="${B}" stroke-linecap="butt" stroke-linejoin="miter"/>
      <path d="M11.5 37c5.5 3.5 15.5 3.5 21 0v-7s9-4.5 6-10.5c-4-6.5-13.5-3.5-16 4V27v-3.5c-3.5-7.5-13-10.5-16-4-3 6 5 10 5 10V37z" fill="${B}"/>
      <path d="M11.5 30c5.5-3 15.5-3 21 0m-21 3.5c5.5-3 15.5-3 21 0m-21 3.5c5.5-3 15.5-3 21 0" stroke="${D}"/>
    </g>`),
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

// ── Captured pieces ───────────────────────────────────────────────────────────
//
// Chess.com style: small overlapping piece icons in a strip above/below the board.
// Shows pieces captured BY a given side (i.e. opponent's lost pieces).
// Sorted by value descending: q(9) r(5) b(3) n(3) p(1).
// Material advantage shown as "+N" when ahead.
//
const PIECE_VALUE: Record<string, number> = { q:9, r:5, b:3, n:3, p:1 }

/** From a move history, return which piece types each side captured. */
function computeCaptures(history: Move[]): { w: string[]; b: string[] } {
  const caps: { w: string[]; b: string[] } = { w: [], b: [] }
  for (const move of history) {
    if (move.captured) {
      // The side that moved captured a piece of the opposite colour
      caps[move.color].push(move.captured)
    }
    // en-passant: captured flag is 'p' even without a piece on that square
  }
  // Sort each list by value desc
  for (const side of ['w','b'] as Color[]) {
    caps[side].sort((a,b) => (PIECE_VALUE[b] ?? 0) - (PIECE_VALUE[a] ?? 0))
  }
  return caps
}

/** Material advantage for `side`: positive means `side` is ahead. */
function materialAdvantage(caps: { w: string[]; b: string[] }, side: Color): number {
  const score = (list: string[]) => list.reduce((s,p) => s + (PIECE_VALUE[p] ?? 0), 0)
  return side === 'w'
    ? score(caps.w) - score(caps.b)
    : score(caps.b) - score(caps.w)
}

/**
 * A horizontal strip of small captured-piece icons.
 * `pieces`  — list of piece type chars, already sorted
 * `color`   — the colour of those pieces (to pick the right filter class)
 * `advantage` — if > 0, shows "+N" after the icons
 */
function CapturedPieces({
  pieces, color, advantage,
}: { pieces: string[]; color: Color; advantage: number }) {
  if (pieces.length === 0 && advantage <= 0) {
    return <div className="captured-strip captured-strip--empty" aria-hidden="true" />
  }
  return (
    <div className="captured-strip" aria-label={`Captured pieces: ${pieces.join(' ')}`}>
      <div className="captured-icons">
        {pieces.map((type, i) => (
          <img
            key={i}
            className={`captured-icon captured-icon--${color}`}
            src={PIECE_SVGS[color][type]}
            alt={type}
            draggable={false}
            style={{ zIndex: i }}
          />
        ))}
      </div>
      {advantage > 0 && (
        <span className="captured-advantage">+{advantage}</span>
      )}
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

  // Captured pieces — derived from move history each render
  const caps      = useMemo(() => computeCaptures(history), [history])
  const opponent  = (player === 'w' ? 'b' : 'w') as Color
  // Strip shown above board: pieces the opponent took from you (your colour, opponent captured)
  const topStrip  = { pieces: caps[opponent], color: player,   adv: materialAdvantage(caps, opponent) }
  // Strip shown below board: pieces you took from opponent (opponent colour, you captured)
  const botStrip  = { pieces: caps[player],   color: opponent, adv: materialAdvantage(caps, player)  }
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

  // ── SETUP ──────────────────────────────────────────────────────────────────
  if (setupOpen) return (
    <main className="setup-shell">
      <section className="setup-card" aria-labelledby="setup-title">
        <div className="brand">
          <span className="brand-mark">♞</span>
          <span className="brand-name">Woodland Chess</span>
        </div>
        <div className="setup-heading">
          <span className="setup-kicker">New game</span>
          <h1 id="setup-title">Set your opponent</h1>
        </div>
        <p className="setup-copy">Choose a playing school and strength before the board opens.</p>
        <Dropdown
          label="Chess school"
          value={school}
          onChange={v => setSchool(v as ChessSchool)}
          options={Object.entries(schools).map(([id, p]) => ({ value: id, label: p.label, summary: p.summary }))}
        />
        <div className="school-weights">
          <WeightBar label="Attack" value={w.attack} color="var(--w-attack)" />
          <WeightBar label="Focus"  value={w.focus}  color="var(--w-focus)"  />
          <WeightBar label="Defend" value={w.defend} color="var(--w-defend)" />
        </div>
        <Dropdown
          label="Difficulty"
          value={difficulty}
          onChange={v => setDifficulty(v as Difficulty)}
          options={['Relaxed', 'Classic', 'Expert'].map(d => ({ value: d, label: d }))}
        />
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
        <div className="board-wrap">
          {/* Opponent's captured pieces — shown above board (pieces they took from you) */}
          <CapturedPieces
            pieces={topStrip.pieces}
            color={topStrip.color}
            advantage={topStrip.adv}
          />
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
          {/* Your captured pieces — shown below board (pieces you took from opponent) */}
          <CapturedPieces
            pieces={botStrip.pieces}
            color={botStrip.color}
            advantage={botStrip.adv}
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
