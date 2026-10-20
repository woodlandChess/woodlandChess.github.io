import { useLayoutEffect, useRef } from 'react'

export interface AnimatedPiece { color: string; type: string }
export type PieceGrid = (AnimatedPiece | null)[][]
type SpringOptions = { stiffness?: number; damping?: number; mass?: number }

/** Damped spring integrator for FLIP overlay sprites. */
export function animateSpring(element: HTMLElement, fromX: number, fromY: number, options: SpringOptions = {}): () => void {
  const stiffness = options.stiffness ?? 420, damping = options.damping ?? 34, mass = options.mass ?? 1
  let x = fromX, y = fromY, vx = 0, vy = 0, previous = performance.now(), frame = 0, cancelled = false
  const finish = () => { element.style.transform = ''; element.remove() }
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || (Math.abs(x) < 0.5 && Math.abs(y) < 0.5)) { finish(); return finish }
  element.style.willChange = 'transform'
  const tick = (now: number) => {
    if (cancelled) return
    const dt = Math.min((now - previous) / 1000, 1 / 30); previous = now
    vx += (-stiffness * x - damping * vx) / mass * dt; vy += (-stiffness * y - damping * vy) / mass * dt
    x += vx * dt; y += vy * dt
    if (Math.abs(x) < 0.25 && Math.abs(y) < 0.25 && Math.abs(vx) < 2 && Math.abs(vy) < 2) { finish(); return }
    element.style.transform = `translate3d(${x}px, ${y}px, 0)`
    frame = requestAnimationFrame(tick)
  }
  element.style.transform = `translate3d(${x}px, ${y}px, 0)`; frame = requestAnimationFrame(tick)
  return () => { cancelled = true; cancelAnimationFrame(frame); finish() }
}

/** FLIP-animates moved pieces in a temporary overlay, preserving normal board DOM and accessibility. */
export function useBoardFlip(board: PieceGrid, orientation: 'w' | 'b' = 'w') {
  const rootRef = useRef<HTMLDivElement>(null)
  const previous = useRef<{ board: PieceGrid; orientation: 'w' | 'b' } | null>(null)
  useLayoutEffect(() => {
    const root = rootRef.current, old = previous.current
    previous.current = { board, orientation }
    if (!root || !old || old.orientation !== orientation || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const oldPieces = new Map<string, string[]>(), newPieces = new Map<string, string[]>()
    old.board.forEach((row, r) => row.forEach((piece, c) => {
      if (!piece) return
      const k = `${piece.color}${piece.type}`, list = oldPieces.get(k) ?? []
      list.push(squareAt(r, c, orientation)); oldPieces.set(k, list)
    }))
    board.forEach((row, r) => row.forEach((piece, c) => {
      if (!piece) return
      const k = `${piece.color}${piece.type}`, list = newPieces.get(k) ?? []
      list.push(squareAt(r, c, orientation)); newPieces.set(k, list)
    }))
    const moves: { from: string; to: string }[] = []
    for (const [key, froms] of oldPieces) {
      const tos = newPieces.get(key) ?? [], oldSet = new Set(froms), newSet = new Set(tos)
      const stationary = froms.filter(s => newSet.has(s))
      const movingFrom = froms.filter(s => !newSet.has(s)), movingTo = tos.filter(s => !oldSet.has(s))
      for (let i = 0; i < Math.min(movingFrom.length, movingTo.length); i++) moves.push({ from: movingFrom[i], to: movingTo[i] })
      const usedFrom = new Set([...stationary, ...movingFrom]), usedTo = new Set([...stationary, ...movingTo])
      const extraFrom = froms.filter(s => !usedFrom.has(s)), extraTo = tos.filter(s => !usedTo.has(s))
      for (let i = 0; i < Math.min(extraFrom.length, extraTo.length); i++) moves.push({ from: extraFrom[i], to: extraTo[i] })
    }
    const cleanup: (() => void)[] = []
    for (const { from, to } of moves) {
      const fromSquare = root.querySelector<HTMLElement>(`[data-square="${from}"]`)
      const toSquare = root.querySelector<HTMLElement>(`[data-square="${to}"]`)
      const image = fromSquare?.querySelector<HTMLImageElement>('.piece-svg')
      if (!fromSquare || !toSquare || !image) continue
      const a = fromSquare.getBoundingClientRect(), b = toSquare.getBoundingClientRect()
      const sprite = image.cloneNode(true) as HTMLImageElement
      Object.assign(sprite.style, { position: 'fixed', left: `${b.left}px`, top: `${b.top}px`, width: `${b.width}px`, height: `${b.height}px`, margin: '0', pointerEvents: 'none', zIndex: '5' })
      sprite.setAttribute('aria-hidden', 'true'); sprite.alt = ''
      document.body.append(sprite)
      cleanup.push(animateSpring(sprite, a.left - b.left, a.top - b.top))
    }
    return () => cleanup.forEach(fn => fn())
  }, [board, orientation])
  return rootRef
}

function squareAt(row: number, col: number, orientation: 'w' | 'b') {
  const file = orientation === 'w' ? col : 7 - col, rank = orientation === 'w' ? 7 - row : row
  return `${String.fromCharCode(97 + file)}${rank + 1}`
}
