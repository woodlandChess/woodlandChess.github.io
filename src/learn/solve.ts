import { Chess, type Move } from 'chess.js'

/**
 * A tiny material search used only by the tests. It lets a lesson claim "this
 * wins a piece" and have the claim checked, instead of trusting the author.
 */
const VALUE: Record<string, number> = { p: 100, n: 300, b: 300, r: 500, q: 900, k: 0 }
const MATE = 100000

/** White's material minus Black's, in centipawns. */
export function material(g: Chess): number {
  let s = 0
  for (const row of g.board()) for (const p of row) if (p) s += (p.color === 'w' ? 1 : -1) * VALUE[p.type]
  return s
}

const order = (moves: Move[]) =>
  moves.sort((a, b) => (VALUE[b.captured ?? ''] ?? 0) - (VALUE[a.captured ?? ''] ?? 0) || Number(b.san.includes('+')) - Number(a.san.includes('+')))

function quiesce(g: Chess, alpha: number, beta: number, depth: number): number {
  const stand = material(g)
  const white = g.turn() === 'w'
  if (depth === 0) return stand
  if (white) {
    if (stand >= beta) return stand
    alpha = Math.max(alpha, stand)
    for (const m of order(g.moves({ verbose: true }).filter(x => x.captured))) {
      g.move(m); const v = quiesce(g, alpha, beta, depth - 1); g.undo()
      if (v >= beta) return v
      alpha = Math.max(alpha, v)
    }
    return alpha
  }
  if (stand <= alpha) return stand
  beta = Math.min(beta, stand)
  for (const m of order(g.moves({ verbose: true }).filter(x => x.captured))) {
    g.move(m); const v = quiesce(g, alpha, beta, depth - 1); g.undo()
    if (v <= alpha) return v
    beta = Math.min(beta, v)
  }
  return beta
}

/** Score from White's point of view after `depth` plies plus a short capture search. */
export function search(g: Chess, depth: number, alpha = -Infinity, beta = Infinity): number {
  if (g.isCheckmate()) return g.turn() === 'w' ? -MATE - depth : MATE + depth
  if (g.isDraw() || g.isStalemate()) return 0
  if (depth === 0) return quiesce(g, alpha, beta, 4)
  const white = g.turn() === 'w'
  let best = white ? -Infinity : Infinity
  for (const m of order(g.moves({ verbose: true }))) {
    g.move(m)
    const v = search(g, depth - 1, alpha, beta)
    g.undo()
    if (white) { best = Math.max(best, v); alpha = Math.max(alpha, v) } else { best = Math.min(best, v); beta = Math.min(beta, v) }
    if (beta <= alpha) break
  }
  return best
}

/** Material the side to move wins over the starting balance by playing `san` and then best play for `depth` plies. */
export function gainAfter(fen: string, san: string, depth: number): number {
  const g = new Chess(fen)
  const side = g.turn() === 'w' ? 1 : -1
  const start = material(g)
  g.move(san)
  return side * (search(g, depth) - start)
}

/** Rank every legal move of the side to move by the material it wins at `depth` plies. */
export function rankMoves(fen: string, depth: number): { san: string; gain: number }[] {
  const g = new Chess(fen)
  const side = g.turn() === 'w' ? 1 : -1
  const start = material(g)
  const out = g.moves().map(san => {
    const h = new Chess(fen); h.move(san)
    return { san, gain: side * (search(h, depth - 1) - start) }
  })
  return out.sort((a, b) => b.gain - a.gain)
}

/** True when the side to move can force mate within `plies` own moves. */
export function forcedMate(fen: string, plies: number): boolean {
  const g = new Chess(fen)
  const attack = (n: number): boolean => {
    for (const m of g.moves()) {
      g.move(m)
      let ok = false
      if (g.isCheckmate()) ok = true
      else if (n > 1 && !g.isDraw() && !g.isStalemate()) {
        const replies = g.moves()
        ok = replies.length > 0 && replies.every(r => { g.move(r); const v = attack(n - 1); g.undo(); return v })
      }
      g.undo()
      if (ok) return true
    }
    return false
  }
  return attack(plies)
}
