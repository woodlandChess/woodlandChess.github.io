import { Chess, type Color, type Move, type Square } from 'chess.js'

export type Difficulty = 'Relaxed' | 'Classic' | 'Expert'
export const difficultyDepth: Record<Difficulty, number> = { Relaxed: 1, Classic: 2, Expert: 3 }

const value: Record<string, number> = { p: 100, n: 320, b: 330, r: 500, q: 900, k: 20_000 }
const center = new Set(['c3', 'd3', 'e3', 'f3', 'c4', 'd4', 'e4', 'f4', 'c5', 'd5', 'e5', 'f5', 'c6', 'd6', 'e6', 'f6'])

export function evaluate(game: Chess, perspective: Color): number {
  let score = 0
  for (const rank of game.board()) for (const piece of rank) {
    if (!piece) continue
    const material = value[piece.type]
    const location = `${piece.square}`
    const positional = center.has(location) ? (piece.type === 'p' || piece.type === 'n' ? 12 : 4) : 0
    score += (piece.color === perspective ? 1 : -1) * (material + positional)
  }
  if (game.isCheckmate()) score += game.turn() === perspective ? -100_000 : 100_000
  return score
}

function search(game: Chess, depth: number, alpha: number, beta: number, perspective: Color): number {
  if (depth === 0 || game.isGameOver()) return evaluate(game, perspective)
  const maximizing = game.turn() === perspective
  let best = maximizing ? -Infinity : Infinity
  for (const move of game.moves({ verbose: true })) {
    game.move(move)
    const score = search(game, depth - 1, alpha, beta, perspective)
    game.undo()
    if (maximizing) { best = Math.max(best, score); alpha = Math.max(alpha, best) }
    else { best = Math.min(best, score); beta = Math.min(beta, best) }
    if (beta <= alpha) break
  }
  return best
}

/** Finds a legal move. The original game is never mutated. */
export function chooseMove(game: Chess, depth: number, color: Color): Move | null {
  if (game.turn() !== color || game.isGameOver()) return null
  const analysis = new Chess(game.fen())
  let bestScore = -Infinity
  let candidates: Move[] = []
  for (const move of analysis.moves({ verbose: true })) {
    analysis.move(move)
    const score = search(analysis, depth - 1, -Infinity, Infinity, color)
    analysis.undo()
    if (score > bestScore) { bestScore = score; candidates = [move] }
    else if (score === bestScore) candidates.push(move)
  }
  return candidates.length ? candidates[Math.floor(Math.random() * candidates.length)] : null
}

export function moveSan(game: Chess, from: Square, to: Square, promotion = 'q'): Move | null {
  try { return game.move({ from, to, promotion }) } catch { return null }
}

export function gameStatus(game: Chess, player: Color): string {
  if (game.isCheckmate()) return game.turn() === player ? 'Checkmate: Computer wins' : 'Checkmate: You win'
  if (game.isStalemate()) return 'Draw: stalemate'
  if (game.isThreefoldRepetition()) return 'Draw: repetition'
  if (game.isInsufficientMaterial()) return 'Draw: insufficient material'
  if (game.isDrawByFiftyMoves()) return 'Draw: fifty-move rule'
  if (game.inCheck()) return game.turn() === player ? 'Your king is in check' : 'Computer is in check'
  return game.turn() === player ? 'Your move' : 'Thinking…'
}
