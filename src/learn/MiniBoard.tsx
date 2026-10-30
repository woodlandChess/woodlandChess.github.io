import type { Color } from 'chess.js'
import { PIECE_SVGS } from '../pieces'
import '../styles/miniboard.css'

export type Mark = 'from' | 'to' | 'target' | 'pinned'

export interface MiniBoardProps {
  /** Piece placement field of a FEN (the rest of the FEN is ignored). */
  fen: string
  /** Squares to tint, e.g. { e8: 'target' }. */
  marks?: Record<string, Mark>
  /** Arrows between squares, drawn above the pieces. */
  arrows?: [string, string][]
  orientation?: Color
  label: string
  className?: string
}

const FILES = 'abcdefgh'

function parse(fen: string) {
  const rows = fen.split(' ')[0].split('/')
  const cells: ({ color: Color; type: string } | null)[] = []
  for (const row of rows) {
    for (const ch of row) {
      if (/\d/.test(ch)) for (let i = 0; i < Number(ch); i++) cells.push(null)
      else cells.push({ color: ch === ch.toUpperCase() ? 'w' : 'b', type: ch.toLowerCase() })
    }
  }
  return cells.length === 64 ? cells : Array<null>(64).fill(null)
}

/** Square name to its centre in a 0..100 box (so arrows scale with the board). */
function centre(sq: string, flip: boolean): [number, number] {
  const file = FILES.indexOf(sq[0])
  const rank = Number(sq[1])
  const col = flip ? 7 - file : file
  const row = flip ? rank - 1 : 8 - rank
  return [(col + 0.5) * 12.5, (row + 0.5) * 12.5]
}

/**
 * A small, static board for lessons and teasers. It uses the same piece
 * artwork and tints as the real board (including the .piece-svg filters), so a
 * diagram looks like a position from the game, not a screenshot.
 */
export function MiniBoard({ fen, marks = {}, arrows = [], orientation = 'w', label, className = '' }: MiniBoardProps) {
  const flip = orientation === 'b'
  const cells = parse(fen)
  const order = Array.from({ length: 64 }, (_, i) => (flip ? 63 - i : i))

  return (
    <div className={`mb ${className}`} role="img" aria-label={label}>
      <div className="mb-grid">
        {order.map((idx, i) => {
          const file = idx % 8
          const rank = 8 - Math.floor(idx / 8)
          const sq = `${FILES[file]}${rank}`
          const piece = cells[idx]
          const mark = marks[sq]
          return (
            <div key={sq} className={`mb-sq ${(file + rank) % 2 === 1 ? 'mb-sq--l' : 'mb-sq--d'}${mark ? ` mb-sq--${mark}` : ''}`}>
              {i % 8 === 0 && <small className="mb-rank">{rank}</small>}
              {i >= 56 && <small className="mb-file">{FILES[file]}</small>}
              {piece && (
                <img className={`piece-svg piece-svg--${piece.color}`}
                  src={PIECE_SVGS[piece.color][piece.type]} alt="" draggable={false} />
              )}
            </div>
          )
        })}
      </div>
      {arrows.length > 0 && (
        <svg className="mb-arrows" viewBox="0 0 100 100" aria-hidden="true" focusable="false">
          <defs>
            <marker id="mb-head" viewBox="0 0 10 10" refX="6.5" refY="5" markerWidth="4" markerHeight="4" orient="auto">
              <path d="M0 0L10 5L0 10z" fill="currentColor" />
            </marker>
          </defs>
          {arrows.map(([a, b]) => {
            const [x1, y1] = centre(a, flip)
            const [x2, y2] = centre(b, flip)
            return <line key={a + b} x1={x1} y1={y1} x2={x2} y2={y2} markerEnd="url(#mb-head)" />
          })}
        </svg>
      )}
    </div>
  )
}
