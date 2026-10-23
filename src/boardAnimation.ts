import { useEffect, useLayoutEffect, useRef } from 'react'
import { markDragDrop, slideMs } from './boardTiming'

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
  markDragDrop()
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

interface Slide { from: [number, number]; to: [number, number]; capture: boolean }

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
      slides.push({ from: [from.r, from.c], to: [to.r, to.c], capture: false })
      arrived.splice(i, 1)
    } else i++
  }
  // Promotion: the pawn that vanished becomes the new piece on the last rank.
  for (let i = 0; i < arrived.length;) {
    const to = arrived[i]
    const j = vacated.findIndex(v => v.k === `${to.k[0]}p` && dist(v, to) <= 1)
    if (j >= 0 && to.k[1] !== 'p') {
      const from = take(vacated, j)
      slides.push({ from: [from.r, from.c], to: [to.r, to.c], capture: false })
      arrived.splice(i, 1)
    } else i++
  }
  // A piece left the board without sliding anywhere: it was taken (incl. en passant).
  if (vacated.length > 0) for (const sl of slides) sl.capture = true
  return slides
}


/** How hard each piece lands (board thump in px). Heavier pieces hit harder. */
const MASS: Record<string, number> = { p: 1.3, n: 1.8, b: 1.8, r: 2.2, q: 2.6, k: 2.8 }

/**
 * The landing: the piece compresses against the board and the contact shadow
 * flashes wider and darker. The board itself only vibrates when a piece is TAKEN -
 * ordinary moves leave it still.
 * All decorative - failures are ignored and nothing here changes the position.
 */
function impact(root: HTMLElement, square: HTMLElement, image: HTMLElement, mass: number, capture: boolean, reduce: boolean) {
  try {
    image.animate(
      [
        { transform: `scale(${1 + 0.02 * mass}, ${1 - 0.045 * mass})`, transformOrigin: '50% 92%' },
        { transform: `scale(${1 - 0.006 * mass}, ${1 + 0.012 * mass})`, transformOrigin: '50% 92%', offset: 0.4 },
        { transform: 'scale(1, 1)', transformOrigin: '50% 92%' },
      ],
      { duration: reduce ? 120 : 230, easing: 'cubic-bezier(0.2, 0.8, 0.3, 1)' },
    )
  } catch { /* decorative only */ }
  if (reduce) return
  try {
    if (capture) root.animate(
      [
        { transform: 'translate3d(0, 0, 0)' },
        { transform: `translate3d(0, ${mass * 0.8}px, 0)`, offset: 0.22 },
        { transform: `translate3d(0, ${-mass * 0.3}px, 0)`, offset: 0.55 },
        { transform: 'translate3d(0, 0, 0)' },
      ],
      { duration: 200, easing: 'ease-out' },
    )
  } catch { /* decorative only */ }
  try {
    square.animate(
      [
        { opacity: 0.4, transform: 'translateX(-50%) scale(1.3, 1.2)' },
        { opacity: 1, transform: 'translateX(-50%) scale(1, 1)' },
      ],
      { duration: 240, easing: 'ease-out', pseudoElement: '::after' },
    )
  } catch { /* pseudo-element animation is not available everywhere */ }
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

    for (const { from, to, capture } of slides) {
      const fromSq = root.querySelector<HTMLElement>(`[data-square="${squareAt(from[0], from[1])}"]`)
      const toSq = root.querySelector<HTMLElement>(`[data-square="${squareAt(to[0], to[1])}"]`)
      const image = toSq?.querySelector<HTMLImageElement>('.piece-svg')
      if (!fromSq || !toSq || !image) continue
      const a = fromSq.getBoundingClientRect(), b = toSq.getBoundingClientRect()
      const dx = a.left - b.left, dy = a.top - b.top
      if (Math.abs(dx) < 1 && Math.abs(dy) < 1) continue

      // The sprite is a whole square-sized stage holding the piece AND its own
      // contact shadow, so the shadow travels with the piece and stays glued under
      // its base. The real square's shadow is hidden meanwhile.
      const stage = document.createElement('div')
      stage.className = `piece-sprite piece-t-${image.dataset.piece?.[1] ?? 'p'}`
      stage.setAttribute('aria-hidden', 'true')
      Object.assign(stage.style, {
        left: `${b.left - rootRect.left - root.clientLeft}px`,
        top: `${b.top - rootRect.top - root.clientTop}px`,
        width: `${b.width}px`, height: `${b.height}px`,
      })
      const shadow = document.createElement('span')
      shadow.className = 'piece-sprite__shadow'
      const sprite = image.cloneNode(true) as HTMLImageElement
      sprite.alt = ''
      sprite.style.transition = 'none'
      stage.append(shadow, sprite)
      root.append(stage)
      const priorVisibility = image.style.visibility
      image.style.visibility = 'hidden'
      toSq.dataset.landing = '1'

      const duration = slideMs()
      const kind = image.dataset.piece?.[1] ?? 'p'
      const mass = MASS[kind] ?? 1
      let done = false
      let timer = 0
      let anim: Animation | null = null
      const finish = (landed = false) => {
        if (done) return
        done = true
        window.clearTimeout(timer)
        try { anim?.cancel() } catch { /* already finished */ }
        stage.remove()
        image.style.visibility = priorVisibility
        delete toSq.dataset.landing
        active.current.delete(interrupt)
        if (landed) impact(root, toSq, image, mass, capture, !!reduce)
      }
      const interrupt: Finisher = () => finish(false)
      active.current.add(interrupt)
      try {
        // Heavy: the piece is not lifted - it is pushed across the wood. It starts
        // sluggishly (inertia), builds speed, and is stopped dead by the square
        // (almost no cushioning at the end); the landing is what you feel.
        anim = stage.animate(
          [{ transform: `translate3d(${dx}px, ${dy}px, 0)` }, { transform: 'translate3d(0, 0, 0)' }],
          { duration, easing: reduce ? 'ease-out' : 'cubic-bezier(0.5, 0, 0.9, 0.85)', fill: 'both' },
        )
        anim.onfinish = () => finish(true)
        anim.oncancel = () => finish(false)
      } catch { finish(false); continue }
      timer = window.setTimeout(() => finish(true), duration + 250)   // failsafe: the real piece always comes back
    }
    // Intentionally keyed on the position signature only (see header comment).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sig, orientation])

  useEffect(() => () => finishAll(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [])

  return rootRef
}
