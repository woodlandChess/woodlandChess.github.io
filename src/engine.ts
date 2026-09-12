import { Chess, type Color, type Move } from 'chess.js'

export type Difficulty = 'Relaxed' | 'Classic' | 'Expert'
export const difficultyDepth: Record<Difficulty, number> = { Relaxed: 2, Classic: 3, Expert: 4 }

// ── Material values ──────────────────────────────────────────────────────────
const value: Record<string, number> = { p: 100, n: 320, b: 330, r: 500, q: 900, k: 20_000 }

// ── Piece-square tables (from White's perspective; flip for Black) ────────────
const PST: Record<string, number[]> = {
  p: [
     0,  0,  0,  0,  0,  0,  0,  0,
    50, 50, 50, 50, 50, 50, 50, 50,
    10, 10, 20, 30, 30, 20, 10, 10,
     5,  5, 10, 25, 25, 10,  5,  5,
     0,  0,  0, 20, 20,  0,  0,  0,
     5, -5,-10,  0,  0,-10, -5,  5,
     5, 10, 10,-20,-20, 10, 10,  5,
     0,  0,  0,  0,  0,  0,  0,  0,
  ],
  n: [
    -50,-40,-30,-30,-30,-30,-40,-50,
    -40,-20,  0,  0,  0,  0,-20,-40,
    -30,  0, 10, 15, 15, 10,  0,-30,
    -30,  5, 15, 20, 20, 15,  5,-30,
    -30,  0, 15, 20, 20, 15,  0,-30,
    -30,  5, 10, 15, 15, 10,  5,-30,
    -40,-20,  0,  5,  5,  0,-20,-40,
    -50,-40,-30,-30,-30,-30,-40,-50,
  ],
  b: [
    -20,-10,-10,-10,-10,-10,-10,-20,
    -10,  0,  0,  0,  0,  0,  0,-10,
    -10,  0,  5, 10, 10,  5,  0,-10,
    -10,  5,  5, 10, 10,  5,  5,-10,
    -10,  0, 10, 10, 10, 10,  0,-10,
    -10, 10, 10, 10, 10, 10, 10,-10,
    -10,  5,  0,  0,  0,  0,  5,-10,
    -20,-10,-10,-10,-10,-10,-10,-20,
  ],
  r: [
     0,  0,  0,  0,  0,  0,  0,  0,
     5, 10, 10, 10, 10, 10, 10,  5,
    -5,  0,  0,  0,  0,  0,  0, -5,
    -5,  0,  0,  0,  0,  0,  0, -5,
    -5,  0,  0,  0,  0,  0,  0, -5,
    -5,  0,  0,  0,  0,  0,  0, -5,
    -5,  0,  0,  0,  0,  0,  0, -5,
     0,  0,  0,  5,  5,  0,  0,  0,
  ],
  q: [
    -20,-10,-10, -5, -5,-10,-10,-20,
    -10,  0,  0,  0,  0,  0,  0,-10,
    -10,  0,  5,  5,  5,  5,  0,-10,
     -5,  0,  5,  5,  5,  5,  0, -5,
      0,  0,  5,  5,  5,  5,  0, -5,
    -10,  5,  5,  5,  5,  5,  0,-10,
    -10,  0,  5,  0,  0,  0,  0,-10,
    -20,-10,-10, -5, -5,-10,-10,-20,
  ],
  k: [
    -30,-40,-40,-50,-50,-40,-40,-30,
    -30,-40,-40,-50,-50,-40,-40,-30,
    -30,-40,-40,-50,-50,-40,-40,-30,
    -30,-40,-40,-50,-50,-40,-40,-30,
    -20,-30,-30,-40,-40,-30,-30,-20,
    -10,-20,-20,-20,-20,-20,-20,-10,
     20, 20,  0,  0,  0,  0, 20, 20,
     20, 30, 10,  0,  0, 10, 30, 20,
  ],
}

// ── School-specific analysis weight profiles ─────────────────────────────────
// Each school weights three axes: attack (aggression), focus (initiative/center),
// defend (safety/structure). These tune the evaluation function.
export interface SchoolWeights {
  attack: number   // multiplier on opponent-king proximity bonus & mobility threats
  focus: number    // multiplier on piece-square table (development / center control)
  defend: number   // multiplier on king safety & pawn structure bonuses
}

export const schoolWeights: Record<string, SchoolWeights> = {
  Universal:          { attack: 1.0, focus: 1.0, defend: 1.0 },
  Soviet:             { attack: 0.9, focus: 1.1, defend: 1.1 },
  British:            { attack: 0.8, focus: 1.0, defend: 1.3 },
  'Classical German': { attack: 1.0, focus: 1.3, defend: 0.9 },
  Hungarian:          { attack: 0.7, focus: 0.9, defend: 1.5 },
  American:           { attack: 1.0, focus: 1.2, defend: 1.0 },
  Attacking:          { attack: 1.8, focus: 1.1, defend: 0.5 },
  Defensive:          { attack: 0.5, focus: 0.8, defend: 1.8 },
  Positional:         { attack: 0.7, focus: 1.4, defend: 1.1 },
  Dynamic:            { attack: 1.4, focus: 1.2, defend: 0.7 },
}

/** Square index 0–63 from White's point of view. */
function pstIndex(square: string, color: Color): number {
  const file = square.charCodeAt(0) - 97       // a=0 … h=7
  const rank = parseInt(square[1]) - 1         // 1=0 … 8=7
  return color === 'w'
    ? (7 - rank) * 8 + file                    // White: rank 8 is row 0
    : rank * 8 + file                          // Black: rank 1 is row 0
}

// ── Evaluation ───────────────────────────────────────────────────────────────
export function evaluate(
  game: Chess,
  perspective: Color,
  weights: SchoolWeights = schoolWeights.Universal
): number {
  if (game.isCheckmate()) return game.turn() === perspective ? -100_000 : 100_000
  if (game.isStalemate() || game.isInsufficientMaterial() || game.isThreefoldRepetition()) return 0

  let score = 0

  for (const rank of game.board()) {
    for (const piece of rank) {
      if (!piece) continue
      const side = piece.color === perspective ? 1 : -1
      const mat  = value[piece.type]
      const pst  = (PST[piece.type]?.[pstIndex(piece.square, piece.color)] ?? 0)

      // Focus weight on positional tables
      score += side * (mat + pst * weights.focus)
    }
  }

  // ── Attack weight: bonus for pieces near the enemy king ───────────────────
  const enemyKing = game
    .board()
    .flat()
    .find(p => p && p.type === 'k' && p.color !== perspective)
  if (enemyKing) {
    const ekFile = enemyKing.square.charCodeAt(0) - 97
    const ekRank = parseInt(enemyKing.square[1]) - 1
    for (const rank of game.board()) {
      for (const piece of rank) {
        if (!piece || piece.color !== perspective || piece.type === 'k') continue
        const pFile = piece.square.charCodeAt(0) - 97
        const pRank = parseInt(piece.square[1]) - 1
        const dist  = Math.max(Math.abs(pFile - ekFile), Math.abs(pRank - ekRank))
        // Chebyshev distance 1 or 2 → attacker nearby
        if (dist <= 2) score += (3 - dist) * 8 * weights.attack
      }
    }
  }

  // ── Defend weight: pawn shield, doubled-pawn penalty ─────────────────────
  const myKing = game
    .board()
    .flat()
    .find(p => p && p.type === 'k' && p.color === perspective)
  if (myKing) {
    const kFile = myKing.square.charCodeAt(0) - 97
    const kRank = parseInt(myKing.square[1]) - 1
    const shieldRank = perspective === 'w' ? kRank + 1 : kRank - 1

    for (const rank of game.board()) {
      for (const piece of rank) {
        if (!piece || piece.type !== 'p' || piece.color !== perspective) continue
        const pFile = piece.square.charCodeAt(0) - 97
        const pRank = parseInt(piece.square[1]) - 1
        // Pawn on the file adjacent to king and one rank ahead → shield
        if (Math.abs(pFile - kFile) <= 1 && pRank === shieldRank) {
          score += 15 * weights.defend
        }
        // Doubled pawn penalty (simple: check if another friendly pawn is on same file)
        const doubled = game.board().flat().some(p =>
          p && p.type === 'p' && p.color === perspective &&
          p.square !== piece.square &&
          p.square.charCodeAt(0) - 97 === pFile
        )
        if (doubled) score -= 10 * weights.defend
      }
    }
  }

  return score
}

// ── Alpha-beta minimax ───────────────────────────────────────────────────────
function search(
  game: Chess,
  depth: number,
  alpha: number,
  beta: number,
  perspective: Color,
  weights: SchoolWeights
): number {
  if (depth === 0 || game.isGameOver()) return evaluate(game, perspective, weights)
  const maximizing = game.turn() === perspective

  // Move ordering: captures first (helps alpha-beta prune faster)
  const moves = game.moves({ verbose: true }).sort((a, b) => {
    const aCapture = a.captured ? value[a.captured] - value[a.piece] : 0
    const bCapture = b.captured ? value[b.captured] - value[b.piece] : 0
    return bCapture - aCapture
  })

  let best = maximizing ? -Infinity : Infinity
  for (const move of moves) {
    game.move(move)
    const score = search(game, depth - 1, alpha, beta, perspective, weights)
    game.undo()
    if (maximizing) {
      best  = Math.max(best, score)
      alpha = Math.max(alpha, best)
    } else {
      best = Math.min(best, score)
      beta = Math.min(beta, best)
    }
    if (beta <= alpha) break  // ← Alpha-beta cut
  }
  return best
}

/** Finds a legal move using school-weighted α–β. The original game is never mutated. */
export function chooseMove(
  game: Chess,
  depth: number,
  color: Color,
  weights: SchoolWeights = schoolWeights.Universal
): Move | null {
  if (game.turn() !== color || game.isGameOver()) return null
  const analysis = new Chess(game.fen())
  let bestScore  = -Infinity
  let candidates: Move[] = []

  const moves = analysis.moves({ verbose: true }).sort((a, b) => {
    const aCapture = a.captured ? value[a.captured] - value[a.piece] : 0
    const bCapture = b.captured ? value[b.captured] - value[b.piece] : 0
    return bCapture - aCapture
  })

  for (const move of moves) {
    analysis.move(move)
    const score = search(analysis, depth - 1, -Infinity, Infinity, color, weights)
    analysis.undo()
    if (score > bestScore) { bestScore = score; candidates = [move] }
    else if (score === bestScore) candidates.push(move)
  }
  return candidates.length ? candidates[Math.floor(Math.random() * candidates.length)] : null
}

export function gameStatus(game: Chess, player: Color): string {
  if (game.isCheckmate()) return game.turn() === player ? 'Checkmate — computer wins' : 'Checkmate — you win'
  if (game.isStalemate()) return 'Draw: stalemate'
  if (game.isThreefoldRepetition()) return 'Draw: repetition'
  if (game.isInsufficientMaterial()) return 'Draw: insufficient material'
  if (game.isDrawByFiftyMoves()) return 'Draw: fifty-move rule'
  if (game.inCheck()) return game.turn() === player ? 'Your king is in check' : 'Computer is in check'
  return game.turn() === player ? 'Your move' : 'Thinking…'
}
