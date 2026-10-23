/**
 * A small opening table used to name computer games (Lichess games arrive with an
 * official opening name). Longest matching move prefix wins; anything else falls
 * back to a family name from the first move.
 */
const T: [string, string][] = [
  ['Ruy Lopez', 'e4 e5 Nf3 Nc6 Bb5'], ['Two Knights Defense', 'e4 e5 Nf3 Nc6 Bc4 Nf6'], ['Giuoco Piano', 'e4 e5 Nf3 Nc6 Bc4 Bc5'], ['Italian Game', 'e4 e5 Nf3 Nc6 Bc4'], ['Scotch Game', 'e4 e5 Nf3 Nc6 d4'],
  ['Four Knights Game', 'e4 e5 Nf3 Nc6 Nc3 Nf6'], ['Petrov Defense', 'e4 e5 Nf3 Nf6'], ['Philidor Defense', 'e4 e5 Nf3 d6'],
  ["King's Gambit", 'e4 e5 f4'], ['Vienna Game', 'e4 e5 Nc3'], ["Bishop's Opening", 'e4 e5 Bc4'], ['Center Game', 'e4 e5 d4'],
  ['Sicilian Defense: Najdorf', 'e4 c5 Nf3 d6 d4 cxd4 Nxd4 Nf6 Nc3 a6'], ['Sicilian Defense: Dragon', 'e4 c5 Nf3 d6 d4 cxd4 Nxd4 Nf6 Nc3 g6'],
  ['Sicilian Defense: Alapin', 'e4 c5 c3'], ['Sicilian Defense', 'e4 c5'],
  ['French Defense: Advance', 'e4 e6 d4 d5 e5'], ['French Defense', 'e4 e6'], ['Caro-Kann Defense', 'e4 c6'],
  ['Scandinavian Defense', 'e4 d5'], ['Alekhine Defense', 'e4 Nf6'], ['Pirc Defense', 'e4 d6'], ['Modern Defense', 'e4 g6'],
  ["Queen's Gambit Declined", 'd4 d5 c4 e6'], ["Queen's Gambit Accepted", 'd4 d5 c4 dxc4'], ['Slav Defense', 'd4 d5 c4 c6'], ["Queen's Gambit", 'd4 d5 c4'],
  ['London System', 'd4 d5 Bf4'], ['London System', 'd4 Nf6 Bf4'], ['Colle System', 'd4 d5 Nf3 Nf6 e3'],
  ["Nimzo-Indian Defense", 'd4 Nf6 c4 e6 Nc3 Bb4'], ["Queen's Indian Defense", 'd4 Nf6 c4 e6 Nf3 b6'],
  ['Grünfeld Defense', 'd4 Nf6 c4 g6 Nc3 d5'], ["King's Indian Defense", 'd4 Nf6 c4 g6'], ['Benoni Defense', 'd4 Nf6 c4 c5 d5'],
  ['Dutch Defense', 'd4 f5'], ['Indian Defense', 'd4 Nf6'], ["Queen's Pawn Game", 'd4 d5'], ["Queen's Pawn Game", 'd4'],
  ['English Opening', 'c4'], ['Réti Opening', 'Nf3 d5 c4'], ["King's Indian Attack", 'Nf3 d5 g3'], ['Réti Opening', 'Nf3'],
  ["Bird's Opening", 'f4'], ['Nimzowitsch-Larsen Attack', 'b3'], ['Polish Opening', 'b4'], ['Grob Opening', 'g4'],
  ["King's Pawn Game", 'e4 e5'], ["King's Pawn Game", 'e4'],
]

const sans = (s: string) => s.split(' ')
const table = T.map(([name, line]) => ({ name, moves: sans(line) })).sort((a, b) => b.moves.length - a.moves.length)

/** Names an opening from SAN moves ("e4", "e5", "Nf3", ...). */
export function classifyOpening(san: string[]): string {
  const clean = san.slice(0, 14).map(m => m.replace(/[+#!?]/g, ''))
  for (const o of table) if (o.moves.length <= clean.length && o.moves.every((m, i) => m === clean[i])) return o.name
  return 'Unclassified opening'
}

/** "Sicilian Defense: Najdorf Variation" -> "Sicilian Defense". Used to group a repertoire. */
export const openingFamily = (name: string) => name.split(':')[0].trim()
