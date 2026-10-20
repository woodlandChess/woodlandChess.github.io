import type { Chess, Color, Square } from 'chess.js'
import { PIECE_SVGS, files, ranks, squareName } from './pieces'
import { useBoardFlip, type PieceGrid } from './boardAnimation'

type BoardSquares = ReturnType<Chess['board']>

/** One highlighted move. `color` is the side that played it, so the highlight matches the pieces. */
export interface TrailMove { from: Square; to: Square; color: Color }

/**
 * Shared chessboard grid, used by both the vs-Computer mode and the Lichess
 * multiplayer mode. Purely presentational - callers own all game state and
 * pass in a `board` snapshot (from `chess.board()`) plus interaction state.
 *
 * `orientation` flips which side is shown at the bottom, for playing as
 * Black online. Square colouring is unaffected by orientation: flipping
 * both row and column order preserves checkerboard parity.
 */
export function ChessBoard({
  board, onSquareClick, selected, legalTargets, lastFrom, lastTo, trail,
  orientation = 'w', interactive = true,
}: {
  board: BoardSquares
  onSquareClick: (square: Square) => void
  selected: Square | null
  legalTargets: Square[]
  lastFrom?: Square
  lastTo?: Square
  /**
   * The last move of each side, newest first. Squares are tinted by who moved
   * (ivory for White, steel for Black) with a stronger destination, so both
   * players' latest moves stay readable at a glance. Overrides lastFrom/lastTo.
   */
  trail?: TrailMove[]
  orientation?: Color
  interactive?: boolean
}) {
  const rowOrder = orientation === 'w' ? [0,1,2,3,4,5,6,7] : [7,6,5,4,3,2,1,0]
  const colOrder = orientation === 'w' ? [0,1,2,3,4,5,6,7] : [7,6,5,4,3,2,1,0]
  const animationRef = useBoardFlip(board as PieceGrid, orientation)

  const marks = new Map<Square, string>()
  for (const m of trail ?? []) {          // newest first, so the newest claims a shared square
    if (!marks.has(m.from)) marks.set(m.from, `trail trail-${m.color}-from`)
    if (!marks.has(m.to))   marks.set(m.to,   `trail trail-${m.color}-to`)
  }

  return (
    <div ref={animationRef} className={`board${interactive ? '' : ' board--locked'}`} role="grid" aria-label="Chess board">
      {rowOrder.flatMap((row, screenRow) =>
        colOrder.map((col, screenCol) => {
          const square = squareName(files[col], ranks[row])
          const piece  = board[row][col]
          const dark   = (row + col) % 2 === 1
          const isLast = !trail && (lastFrom === square || lastTo === square)
          return (
            <button
              key={square}
              role="gridcell"
              type="button"
              disabled={!interactive}
              aria-label={`${square}${piece ? ` ${piece.color === 'w' ? 'white' : 'black'} ${piece.type}` : ''}`}
              className={['square', dark ? 'dark' : 'light', selected === square ? 'selected' : '', isLast ? 'last' : '', marks.get(square) ?? ''].filter(Boolean).join(' ')}
              data-square={square}
              onClick={() => interactive && onSquareClick(square)}
            >
              {screenCol === 0 && <small className="rank">{ranks[row]}</small>}
              {screenRow === 7 && <small className="file">{files[col]}</small>}
              {piece && (
                <img
                  className={`piece-svg piece-svg--${piece.color}`}
                  data-piece={`${piece.color}${piece.type}`}
                  src={PIECE_SVGS[piece.color][piece.type]}
                  alt={`${piece.color === 'w' ? 'white' : 'black'} ${piece.type}`}
                  draggable={false}
                />
              )}
              {interactive && legalTargets.includes(square) && (
                <span className={piece ? 'capture' : 'target'} />
              )}
            </button>
          )
        })
      )}
    </div>
  )
}

/** Shared promotion-choice modal for both game modes. */
export function PromotionModal({
  color, onPick,
}: {
  color: Color
  onPick: (type: 'q' | 'r' | 'b' | 'n') => void
}) {
  return (
    <div className="modal-backdrop">
      <section className="promotion" role="dialog" aria-modal="true" aria-label="Choose promotion piece">
        <h2>Promote pawn</h2>
        <div className="promotion-pieces">
          {(['q','r','b','n'] as const).map(type => (
            <button key={type} onClick={() => onPick(type)}>
              <img
                src={PIECE_SVGS[color][type]}
                alt={`${color === 'w' ? 'white' : 'black'} ${type}`}
                className={`promo-piece-svg promo-piece-svg--${color}`}
              />
            </button>
          ))}
        </div>
      </section>
    </div>
  )
}
