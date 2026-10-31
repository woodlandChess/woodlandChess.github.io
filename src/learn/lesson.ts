import { Chess } from 'chess.js'

export interface Step {
  /** Position after this step. Step 0 is the starting position. */
  fen: string
  san?: string
  from?: string
  to?: string
  /** Move label such as "17b" (Black's 17th move) or "9w". */
  label?: string
}

/** Replay a line of SAN moves from `startFen`, returning every position along the way. */
export function replay(startFen: string, line: string[]): Step[] {
  const g = new Chess(startFen)
  const steps: Step[] = [{ fen: g.fen() }]
  for (const san of line) {
    const side = g.turn()
    const number = Number(g.fen().split(' ')[5])
    const m = g.move(san)
    steps.push({ fen: g.fen(), san: m.san, from: m.from, to: m.to, label: `${number}${side}` })
  }
  return steps
}

/** "17b" and "Be6" become "17...Be6"; "9w" and "Bg5" become "9.Bg5". */
export function moveText(label: string, san: string): string {
  const n = label.slice(0, -1)
  return label.endsWith('w') ? `${n}.${san}` : `${n}...${san}`
}
