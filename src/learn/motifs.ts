import type { Mark } from './MiniBoard'

/**
 * Tactic motifs for the Learn tab. Every position is checked by
 * motifs.test.ts: the FEN is legal, the key move is legal, and the claimed
 * result (check, checkmate, pinned piece frozen) is true.
 */
export interface Motif {
  id: string
  name: string
  /** One line a beginner can hold on to. */
  idea: string
  /** What to look for and why it works. */
  detail: string
  fen: string
  /** The key move, in SAN, played by the side to move in `fen`. */
  move: string
  /** Shown above the board once the move is played. */
  result: string
  marks: Record<string, Mark>
  arrows: [string, string][]
}

export const MOTIFS: Motif[] = [
  {
    id: 'fork',
    name: 'Fork',
    idea: 'One piece attacks two targets, and only one can be saved.',
    detail: 'Knights fork best because nothing can block their jump. Look for a safe square that touches the king and something valuable.',
    fen: 'r3k3/8/8/3N4/8/8/8/4K3 w - - 0 1',
    move: 'Nc7+',
    result: 'The knight checks the king and eyes the rook on a8. After the king steps away, Nxa8 wins it.',
    marks: { a8: 'target', e8: 'target' },
    arrows: [['d5', 'c7']],
  },
  {
    id: 'pin',
    name: 'Pin',
    idea: 'A piece cannot move because something worth more stands behind it.',
    detail: 'Against the king the pin is absolute: the pinned piece may not move at all. Attack it again and it usually falls.',
    fen: '4k3/8/2n5/1B6/8/8/8/4K3 w - - 0 1',
    move: 'Bxc6+',
    result: 'The pinned knight could not run or recapture, so the bishop simply takes it, with check.',
    marks: { c6: 'pinned', e8: 'target' },
    arrows: [['b5', 'e8']],
  },
  {
    id: 'skewer',
    name: 'Skewer',
    idea: 'A pin in reverse: the valuable piece is in front and must step aside.',
    detail: 'Long-range pieces do the work. Force the front piece to move and take whatever stood behind it.',
    fen: 'r7/8/8/k7/8/8/8/1R2K3 w - - 0 1',
    move: 'Ra1+',
    result: 'The king must leave the a-file, and the rook on a8 is left with nothing to protect it.',
    marks: { a5: 'target', a8: 'target' },
    arrows: [['b1', 'a1']],
  },
  {
    id: 'discovery',
    name: 'Discovered attack',
    idea: 'Move one piece and a second one, hidden behind it, strikes.',
    detail: 'The moving piece can capture or threaten while the piece behind it gives check. The opponent can only answer one of them.',
    fen: '3k4/5ppp/2q5/8/3N4/8/5PPP/3RK3 w - - 0 1',
    move: 'Nxc6+',
    result: 'The knight takes the queen and uncovers the rook on the d-file: a double check, so the king has to move.',
    marks: { c6: 'target', d8: 'target' },
    arrows: [['d4', 'c6']],
  },
  {
    id: 'back-rank',
    name: 'Back-rank mate',
    idea: 'A king boxed in by its own pawns has no escape from a rook or queen.',
    detail: 'Before any trade, check whether your own back rank is covered. A single pawn move, a luft, removes the danger.',
    fen: '6k1/5ppp/8/8/8/8/5PPP/R5K1 w - - 0 1',
    move: 'Ra8#',
    result: 'The rook reaches the back rank. The king cannot step forward through its own pawns.',
    marks: { g8: 'target' },
    arrows: [['a1', 'a8']],
  },
  {
    id: 'smothered',
    name: 'Smothered mate',
    idea: 'The king is surrounded by its own pieces and a knight delivers the check.',
    detail: 'Knights are the only pieces that jump the cordon. Watch for a king in the corner hemmed in by a rook and pawns.',
    fen: '6rk/6pp/8/6N1/8/8/8/6K1 w - - 0 1',
    move: 'Nf7#',
    result: 'Every flight square holds a friendly piece and nothing can capture the knight.',
    marks: { h8: 'target' },
    arrows: [['g5', 'f7']],
  },
]
