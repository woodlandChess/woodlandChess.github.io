import { useEffect, useLayoutEffect, useRef } from 'react'

export interface AnimatedPiece { color: string; type: string }
export type PieceGrid = (AnimatedPiece | null)[][]

/**
 * Piece sliding for every board (Computer, Online, Puzzles).
 *
 * How it works: whenever the *position* changes (not on every render), the
 * moved piece is cloned into a sprite that lives INSIDE the board element and is
 * slid from its old square to its new one with the Web Animations API, while the
 * real piece stays hidden until the slide ends.
 *
 * Why it is built this way (all of these were real bugs):
 *  - Square names come straight from the board grid. They must never be mirrored
 *    for Black's view, otherwise the wrong pieces fly around when playing Black.
 *  - The effect depends on a position signature, not on the board array identity.
 *    chess.board() returns a new array on every render; depending on it cancelled
 *    every animation the moment anything else re-rendered (clock, "thinking", ...).
 *  - Only a normal single move (at most 4 changed squares: move, capture, en
 *    passant, castling, promotion) is animated. Resyncs after a reconnect, history
 *    review or a rejected move simply snap, instead of flying unrelated pieces.
 *  - Time-based Web Animations keep working when the browser throttles
 *    requestAnimationFrame (iOS home-screen app, Low Power Mode, backgrounding),
 *    and a failsafe timer always restores the real piece.
 *  - The sprite is positioned relative to the board, so a layout shift mid-move
 *    can no longer leave it stranded at the old screen position.
 */

const MAX_CHANGED_SQUARES = 4
const SUPPRESS_MS = 1000
const suppressed = new WeakMap<HTMLElement, number>()

/** Call right before committing a move the player already showed by dragging the piece. */
export function suppressNextBoardAnimation(root: HTMLElement | null) {
  if (root) suppressed.set(root, performance.now())
}

type Cell = AnimatedPiece | null
const key = (p: Cell) => (p ? `${p.color}${p.type}` : '')
const signatureOf = (board: PieceGrid) =>
  board.map(row => row.map(p => (p ? `${p.color}${p.type}` : '.')).join('')).join('/')

/** Square name for a chess.board() grid cell (row 0 = rank 8, col 0 = file a). */
export function squareAt(row: number, col: number) {
  return `${String.fromCharCode(97 + col)}${8 - row}`
}

interface Slide { from: [number, number]; to: [number, number] }

/** Work out which pieces slid between two positions; null when it is not a plain move. */
export function diffMoves(before: PieceGrid, after: PieceGrid): Slide[] | null {
  const vacated: { r: number; c: number; k: string }[] = []
  const arrived: { r: number; c: number; k: string }[] = []
  let changed = 0
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const a = before[r]?.[c] ?? null, b = after[r]?.[c] ?? null
      if (key(a) === key(b)) continue
      changed++
      if (a) vacated.push({ r, c, k: key(a) })
      if (b) arrived.push({ r, c, k: key(b) })
    }
  }
  if (changed === 0 || changed > MAX_CHANGED_SQUARES) return null

  const slides: Slide[] = []
  const dist = (x: { r: number; c: number }, y: { r: number; c: number }) => Math.max(Math.abs(x.r - y.r), Math.abs(x.c - y.c))
  const take = (arr: typeof vacated, i: number) => arr.splice(i, 1)[0]

  // Same piece, nearest vacated square -> arrived square.
  for (let i = 0; i < arrived.length;) {
    const to = arrived[i]
    let best = -1
    vacated.forEach((v, j) => { if (v.k === to.k && (best < 0 || dist(v, to) < dist(vacated[best], to))) best = j })
    if (best >= 0) {
      const from = take(vacated, best)
      slides.push({ from: [from.r, from.c], to: [to.r, to.c] })
      arrived.splice(i, 1)
    } else i++
  }
  // Promotion: the pawn that vanished becomes the new piece on the last rank.
  for (let i = 0; i < arrived.length;) {
    const to = arrived[i]
    const j = vacated.findIndex(v => v.k === `${to.k[0]}p` && dist(v, to) <= 1)
    if (j >= 0 && to.k[1] !== 'p') {
      const from = take(vacated, j)
      slides.push({ from: [from.r, from.c], to: [to.r, to.c] })
      arrived.splice(i, 1)
    } else i++
  }
  return slides
}

type Finisher = () => void

export function useBoardFlip(board: PieceGrid, orientation: 'w' | 'b' = 'w') {
  const rootRef = useRef<HTMLDivElement>(null)
  const previous = useRef<{ sig: string; board: PieceGrid; orientation: 'w' | 'b' } | null>(null)
  const active = useRef<Set<Finisher>>(new Set())
  const sig = signatureOf(board)

  const finishAll = () => { for (const f of [...active.current]) f() }

  useLayoutEffect(() => {
    const root = rootRef.current
    const old = previous.current
    previous.current = { sig, board, orientation }
    if (!root || !old || old.sig === sig) return
    finishAll()                                               // settle a move still in flight
    if (old.orientation !== orientation) return               // board turned round: just redraw
    if (document.hidden) return                               // nobody is watching
    const stamp = suppressed.get(root)
    suppressed.delete(root)
    if (stamp !== undefined && performance.now() - stamp < SUPPRESS_MS) return

    const slides = diffMoves(old.board, board)
    if (!slides || slides.length === 0) return
    if (typeof Element === 'undefined' || typeof Element.prototype.animate !== 'function') return

    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    if (getComputedStyle(root).position === 'static') root.style.position = 'relative'
    const rootRect = root.getBoundingClientRect()

    for (const { from, to } of slides) {
      const fromSq = root.querySelector<HTMLElement>(`[data-square="${squareAt(from[0], from[1])}"]`)
      const toSq = root.querySelector<HTMLElement>(`[data-square="${squareAt(to[0], to[1])}"]`)
      const image = toSq?.querySelector<HTMLImageElement>('.piece-svg')
      if (!fromSq || !toSq || !image) continue
      const a = fromSq.getBoundingClientRect(), b = toSq.getBoundingClientRect(), p = image.getBoundingClientRect()
      const dx = a.left - b.left, dy = a.top - b.top
      if (Math.abs(dx) < 1 && Math.abs(dy) < 1) continue

      const sprite = image.cloneNode(true) as HTMLImageElement
      sprite.setAttribute('aria-hidden', 'true'); sprite.alt = ''
      Object.assign(sprite.style, {
        position: 'absolute',
        left: `${p.left - rootRect.left - root.clientLeft}px`,
        top: `${p.top - rootRect.top - root.clientTop}px`,
        width: `${p.width}px`, height: `${p.height}px`,
        margin: '0', transition: 'none', pointerEvents: 'none', zIndex: '40', willChange: 'transform',
      })
      root.append(sprite)
      const priorVisibility = image.style.visibility
      image.style.visibility = 'hidden'

      const squares = Math.max(Math.abs(dx), Math.abs(dy)) / Math.max(1, b.width)
      const duration = Math.round((reduce ? 0.6 : 1) * Math.min(320, 150 + squares * 28))
      let done = false
      let timer = 0
      let anim: Animation | null = null
      const finish: Finisher = () => {
        if (done) return
        done = true
        window.clearTimeout(timer)
        try { anim?.cancel() } catch { /* already finished */ }
        sprite.remove()
        image.style.visibility = priorVisibility
        active.current.delete(finish)
      }
      active.current.add(finish)
      try {
        anim = sprite.animate(
          [{ transform: `translate3d(${dx}px, ${dy}px, 0)` }, { transform: 'translate3d(0, 0, 0)' }],
          { duration, easing: reduce ? 'ease-out' : 'cubic-bezier(0.22, 1, 0.36, 1)', fill: 'both' },
        )
        anim.onfinish = finish
        anim.oncancel = finish
      } catch { finish(); continue }
      timer = window.setTimeout(finish, duration + 250)      // failsafe: the real piece always comes back
    }
    // Intentionally keyed on the position signature only (see header comment).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sig, orientation])

  useEffect(() => () => finishAll(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [])

  return rootRef
}
