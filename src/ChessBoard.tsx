import { useRef, useState } from 'react'
import type { Chess, Color, Square } from 'chess.js'
import { PIECE_SVGS, files, ranks, squareName } from './pieces'
import { captureBoardPositions, useBoardFlip, type PieceGrid } from './boardAnimation'

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
  orientation = 'w', interactive = true, beforeBoardChange, boardRef, getLegalTargets, onDropMove,
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
  beforeBoardChange?: () => void
  boardRef?: React.RefObject<HTMLDivElement | null>
  getLegalTargets?: (from: Square) => Square[]
  onDropMove?: (from: Square, to: Square) => void
}) {
  const rowOrder = orientation === 'w' ? [0,1,2,3,4,5,6,7] : [7,6,5,4,3,2,1,0]
  const colOrder = orientation === 'w' ? [0,1,2,3,4,5,6,7] : [7,6,5,4,3,2,1,0]
  const animationRef = useBoardFlip(board as PieceGrid, orientation)
  const setBoardRef = (node: HTMLDivElement | null) => { animationRef.current = node; if (boardRef) boardRef.current = node }
  const dragRef = useRef<{ from: Square; pointerId: number; image: HTMLImageElement; origin: DOMRect; pointerX: number; pointerY: number } | null>(null)
  const [dragFrom, setDragFrom] = useState<Square | null>(null)
  const suppressClick = useRef(false)
  const dragTargets = dragFrom ? getLegalTargets?.(dragFrom) ?? [] : []
  const beforeChange = () => { captureBoardPositions(animationRef.current); beforeBoardChange?.() }

  function startDrag(event: React.PointerEvent<HTMLButtonElement>) {
    if (!interactive || event.button !== 0) return
    const squareEl = (event.target as HTMLElement).closest<HTMLElement>('[data-square]')
    const from = squareEl?.dataset.square as Square | undefined
    if (!squareEl || !from) return
    const row = 8 - Number(from[1]), col = from.charCodeAt(0) - 97
    const piece = board[row]?.[col]
    if (!piece || !(getLegalTargets?.(from) ?? []).length) return
    const image = squareEl.querySelector<HTMLImageElement>('.piece-svg')
    if (!image) return
    dragRef.current = { from, pointerId: event.pointerId, image, origin: image.getBoundingClientRect(), pointerX: event.clientX, pointerY: event.clientY }
    event.currentTarget.setPointerCapture(event.pointerId)
    setDragFrom(from)
  }

  function moveDrag(event: React.PointerEvent<HTMLButtonElement>) {
    const drag = dragRef.current
    if (!drag || drag.pointerId !== event.pointerId || Math.hypot(event.clientX - drag.pointerX, event.clientY - drag.pointerY) < 6) return
    event.preventDefault()
    const dx = event.clientX - drag.pointerX, dy = event.clientY - drag.pointerY
    Object.assign(drag.image.style, { position: 'fixed', left: `${drag.origin.left + dx}px`, top: `${drag.origin.top + dy}px`, width: `${drag.origin.width}px`, height: `${drag.origin.height}px`, zIndex: '10000', pointerEvents: 'none', transition: 'none', transform: 'scale(1.08)' })
  }

  function endDrag(event: React.PointerEvent<HTMLButtonElement>) {
    const drag = dragRef.current
    if (!drag || drag.pointerId !== event.pointerId) return
    dragRef.current = null
    const image = drag.image
    const wasDragged = Math.hypot(event.clientX - drag.pointerX, event.clientY - drag.pointerY) >= 6
    const target = wasDragged ? document.elementFromPoint(event.clientX, event.clientY)?.closest<HTMLElement>('[data-square]')?.dataset.square as Square | undefined : undefined
    setDragFrom(null)
    if (wasDragged) {
      suppressClick.current = true
      window.setTimeout(() => { suppressClick.current = false }, 0)
    }
    if (target && target !== drag.from && (getLegalTargets?.(drag.from) ?? []).includes(target)) { beforeChange(); onDropMove?.(drag.from, target) }
    Object.assign(image.style, { position: '', left: '', top: '', width: '', height: '', zIndex: '', pointerEvents: '', transition: '', transform: '' })
  }

  const marks = new Map<Square, string>()
  for (const m of trail ?? []) {          // newest first, so the newest claims a shared square
    if (!marks.has(m.from)) marks.set(m.from, `trail trail-${m.color}-from`)
    if (!marks.has(m.to))   marks.set(m.to,   `trail trail-${m.color}-to`)
  }

  return (
    <div ref={setBoardRef} className={`board${interactive ? '' : ' board--locked'}`} role="grid" aria-label="Chess board">
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
              onPointerDown={startDrag}
              onPointerMove={moveDrag}
              onPointerUp={endDrag}
              onPointerCancel={endDrag}
              onClick={() => {
                if (suppressClick.current) { suppressClick.current = false; return }
                if (interactive) { beforeChange(); onSquareClick(square) }
              }}
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
              {interactive && (legalTargets.includes(square) || dragTargets.includes(square)) && (
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
