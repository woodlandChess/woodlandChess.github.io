import type { Chess, Color, Square } from 'chess.js'
import { PIECE_SVGS, files, ranks, squareName } from './pieces'

type BoardSquares = ReturnType<Chess['board']>

/**
 * Shared chessboard grid, used by both the vs-Computer mode and the Lichess
 * multiplayer mode. Purely presentational — callers own all game state and
 * pass in a `board` snapshot (from `chess.board()`) plus interaction state.
 *
 * `orientation` flips which side is shown at the bottom, for playing as
 * Black online. Square colouring is unaffected by orientation: flipping
 * both row and column order preserves checkerboard parity.
 */
export function ChessBoard({
  board, onSquareClick, selected, legalTargets, lastFrom, lastTo,
  orientation = 'w', interactive = true,
}: {
  board: BoardSquares
  onSquareClick: (square: Square) => void
  selected: Square | null
  legalTargets: Square[]
  lastFrom?: Square
  lastTo?: Square
  orientation?: Color
  interactive?: boolean
}) {
  const rowOrder = orientation === 'w' ? [0,1,2,3,4,5,6,7] : [7,6,5,4,3,2,1,0]
  const colOrder = orientation === 'w' ? [0,1,2,3,4,5,6,7] : [7,6,5,4,3,2,1,0]

  return (
    <div className={`board${interactive ? '' : ' board--locked'}`} role="grid" aria-label="Chess board">
      {rowOrder.flatMap((row, screenRow) =>
        colOrder.map((col, screenCol) => {
          const square = squareName(files[col], ranks[row])
          const piece  = board[row][col]
          const dark   = (row + col) % 2 === 1
          const isLast = lastFrom === square || lastTo === square
          return (
            <button
              key={square}
              role="gridcell"
              type="button"
              disabled={!interactive}
              aria-label={`${square}${piece ? ` ${piece.color === 'w' ? 'white' : 'black'} ${piece.type}` : ''}`}
              className={['square', dark ? 'dark' : 'light', selected === square ? 'selected' : '', isLast ? 'last' : ''].filter(Boolean).join(' ')}
              onClick={() => interactive && onSquareClick(square)}
            >
              {screenCol === 0 && <small className="rank">{ranks[row]}</small>}
              {screenRow === 7 && <small className="file">{files[col]}</small>}
              {piece && (
                <img
                  className={`piece-svg piece-svg--${piece.color}`}
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
