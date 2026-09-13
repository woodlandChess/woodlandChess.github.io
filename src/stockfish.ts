import type { Difficulty } from './engine'

export type ChessSchool =
  | 'Universal' | 'Soviet' | 'British' | 'Classical German'
  | 'Hungarian' | 'American' | 'Attacking' | 'Defensive'
  | 'Positional' | 'Dynamic'

export interface SchoolProfile {
  label: string
  summary: string
  book: string[]
  // Analysis weight hints shown in UI (attack / focus / defend out of 10)
  weights: { attack: number; focus: number; defend: number }
}

export const schools: Record<ChessSchool, SchoolProfile> = {
  Universal: {
    label: 'Universal',
    summary: 'Adapts to the position with no fixed bias.',
    book: [],
    weights: { attack: 5, focus: 5, defend: 5 },
  },
  Soviet: {
    label: 'Russian (Soviet)',
    summary: 'Sound development, calculation, and balanced play.',
    book: ['d2d4 d7d5', 'c2c4 e7e6', 'g1f3 g8f6'],
    weights: { attack: 4, focus: 6, defend: 6 },
  },
  British: {
    label: 'British',
    summary: 'Practical, flexible choices with sound endgame priorities.',
    book: ['g1f3 g8f6', 'c2c4 e7e5'],
    weights: { attack: 3, focus: 5, defend: 7 },
  },
  'Classical German': {
    label: 'Classical German',
    summary: 'Central control, fast development, and coordination.',
    book: ['e2e4 e7e5', 'g1f3 b8c6', 'f1c4 f8c5'],
    weights: { attack: 5, focus: 8, defend: 4 },
  },
  Hungarian: {
    label: 'Hungarian',
    summary: 'Solid structures, technical defense, and restrained risk.',
    book: ['d2d4 d7d5', 'c2c4 c7c6', 'g1f3 g8f6'],
    weights: { attack: 2, focus: 4, defend: 9 },
  },
  American: {
    label: 'American',
    summary: 'Objective calculation and precise conversion of advantages.',
    book: ['e2e4 c7c5', 'g1f3 d7d6', 'd2d4 c5d4'],
    weights: { attack: 5, focus: 7, defend: 5 },
  },
  Attacking: {
    label: 'Attacking',
    summary: 'Initiative, open lines, and king-side pressure.',
    book: ['e2e4 e7e5', 'f2f4'],
    weights: { attack: 9, focus: 6, defend: 2 },
  },
  Defensive: {
    label: 'Defensive',
    summary: 'Threat prevention first, then a timed counterattack.',
    book: ['d2d4 g8f6', 'c2c4 e7e6'],
    weights: { attack: 2, focus: 4, defend: 9 },
  },
  Positional: {
    label: 'Positional',
    summary: 'Pawn structure, piece placement, and gradual improvement.',
    book: ['d2d4 d7d5', 'c2c4 e7e6', 'b1c3 g8f6'],
    weights: { attack: 3, focus: 9, defend: 6 },
  },
  Dynamic: {
    label: 'Dynamic',
    summary: 'Active pieces, initiative, and persistent pressure.',
    book: ['e2e4 c7c5', 'g1f3 d7d6', 'd2d4 c5d4'],
    weights: { attack: 7, focus: 7, defend: 3 },
  },
}

/** Returns the next school-book move while the played line matches a profile. */
export function schoolBookMove(school: ChessSchool, played: string[]): string | null {
  for (const line of schools[school].book) {
    const moves = line.split(' ')
    if (played.length < moves.length && played.every((m, i) => m === moves[i])) {
      return moves[played.length]
    }
  }
  return null
}

const settings: Record<Difficulty, { skill: number; time: number }> = {
  Relaxed: { skill: 5,  time: 150  },
  Classic: { skill: 13, time: 650  },
  Expert:  { skill: 20, time: 1600 },
}

export class StockfishClient {
  private readonly worker: Worker
  // Track readiness with a Promise so concurrent callers all wait on the same
  // resolution and there is no race where 'readyok' arrives before a listener
  // has been registered.
  private readyPromise: Promise<void>
  private resolveReady!: () => void
  private queue: Array<(line: string) => void> = []

  constructor() {
    this.readyPromise = new Promise<void>(resolve => {
      this.resolveReady = resolve
    })

    const root = import.meta.env.BASE_URL
    this.worker = new Worker(
      `${root}stockfish-18-lite-single.js#${root}stockfish-18-lite-single.wasm`
    )
    this.worker.onmessage = ({ data }) => this.handle(String(data))
    this.worker.onerror   = event => console.error('Stockfish worker failed:', event.message)
    this.send('uci')
  }

  dispose() {
    this.worker.postMessage('quit')
    this.worker.terminate()
  }

  private send(command: string) { this.worker.postMessage(command) }

  private handle(line: string) {
    // When UCI handshake completes, request readiness confirmation
    if (line === 'uciok') {
      this.send('isready')
      return
    }
    // When engine confirms it is ready, resolve the shared promise so all
    // waiting bestMove() calls unblock simultaneously — no listener miss.
    if (line === 'readyok') {
      this.resolveReady()
      return
    }
    // Dispatch to the first registered one-shot resolver (bestmove lines, etc.)
    const resolver = this.queue[0]
    if (resolver) resolver(line)
  }

  private until(match: (line: string) => boolean): Promise<string> {
    return new Promise(resolve => {
      const listen = (line: string) => {
        if (match(line)) { this.queue.shift(); resolve(line) }
      }
      this.queue.push(listen)
    })
  }

  async bestMove(fen: string, difficulty: Difficulty): Promise<string | null> {
    const { skill, time } = settings[difficulty]
    // Wait for 'readyok' via the shared Promise — safe to call multiple times
    // because Promise resolution is idempotent and already-resolved Promises
    // return immediately.
    await this.readyPromise
    this.send(`setoption name Skill Level value ${skill}`)
    this.send('ucinewgame')
    this.send(`position fen ${fen}`)
    const result = this.until(line => line.startsWith('bestmove '))
    this.send(`go movetime ${time}`)
    const line = await result
    const move = line.split(' ')[1]
    return move && move !== '(none)' ? move : null
  }
}
