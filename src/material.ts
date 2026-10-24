import type { Chess, Color } from 'chess.js'

/** Standard piece values in pawns. Kings are never captured, so they carry no value. */
export const PIECE_POINTS: Record<string, number> = { p: 1, n: 3, b: 3, r: 5, q: 9 }

export interface MaterialScore {
  /** Points you have won by capturing (starts at 0). */
  you: number
  /** Points your opponent has won from you (starts at 0). */
  opponent: number
  /** Material on the board from YOUR side: positive when you are ahead, negative when behind, 0 when level. */
  balance: number
}

/**
 * Material score from the player's point of view, for either colour.
 * "Captured" counts the pieces actually taken in the moves played so far, so it starts at 0 and only goes up;
 * "balance" is read from the board (so a promotion counts) and is signed for the player, not for White.
 */
export function materialScore(history: { color: Color; captured?: string }[], position: Chess, player: Color): MaterialScore {
  let you = 0, opponent = 0
  for (const move of history) {
    const points = move.captured ? PIECE_POINTS[move.captured] ?? 0 : 0
    if (move.color === player) you += points
    else opponent += points
  }
  let balance = 0
  for (const row of position.board()) for (const sq of row) if (sq) balance += (sq.color === player ? 1 : -1) * (PIECE_POINTS[sq.type] ?? 0)
  return { you, opponent, balance }
}

/** "+2", "−3" or "0": always signed for the player. */
export const formatBalance = (n: number) => (n > 0 ? `+${n}` : n < 0 ? `−${Math.abs(n)}` : '0')
