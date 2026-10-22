/**
 * Shared timing between the piece slide (boardAnimation) and the move sounds
 * (sound). A piece makes its noise when it lands on the board, not when the move
 * is committed, so the sound waits for the slide - unless the player dragged the
 * piece there themselves (it already arrived under their finger).
 */
const SLIDE_MS = 260
const SLIDE_MS_REDUCED = 140
const DRAG_WINDOW_MS = 80

let lastDragDropAt = -Infinity

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

/** Duration of one piece sliding to its square. */
export const slideMs = () => (prefersReducedMotion() ? SLIDE_MS_REDUCED : SLIDE_MS)

/** Called when a move is committed straight from a drag-and-drop. */
export function markDragDrop(now = performance.now()) { lastDragDropAt = now }

/** How long a piece sound should wait so its click lands with the piece. */
export function landingDelayMs(now = performance.now()): number {
  return now - lastDragDropAt < DRAG_WINDOW_MS ? 0 : Math.round(slideMs() * 0.94)
}
