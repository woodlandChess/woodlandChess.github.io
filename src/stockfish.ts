import type { Difficulty } from './engine'

export type ChessSchool =
  | 'Universal' | 'Soviet' | 'British' | 'Classical German'
  | 'Hungarian' | 'American' | 'Attacking' | 'Defensive'
  | 'Positional' | 'Dynamic'

export interface SchoolProfile {
  label: string
  summary: string
  book: string[]
  weights: { attack: number; focus: number; defend: number }
}

export const schools: Record<ChessSchool, SchoolProfile> = {
  Universal:         { label: 'Universal',        summary: 'Adapts to the position with no fixed bias.',              book: [],                                               weights: { attack: 5, focus: 5, defend: 5 } },
  Soviet:            { label: 'Russian (Soviet)',  summary: 'Sound development, calculation, and balanced play.',      book: ['d2d4 d7d5', 'c2c4 e7e6', 'g1f3 g8f6'],         weights: { attack: 4, focus: 6, defend: 6 } },
  British:           { label: 'British',           summary: 'Practical, flexible choices with sound endgame focus.',   book: ['g1f3 g8f6', 'c2c4 e7e5'],                      weights: { attack: 3, focus: 5, defend: 7 } },
  'Classical German':{ label: 'Classical German',  summary: 'Central control, fast development, and coordination.',    book: ['e2e4 e7e5', 'g1f3 b8c6', 'f1c4 f8c5'],         weights: { attack: 5, focus: 8, defend: 4 } },
  Hungarian:         { label: 'Hungarian',         summary: 'Solid structures, technical defence, restrained risk.',   book: ['d2d4 d7d5', 'c2c4 c7c6', 'g1f3 g8f6'],         weights: { attack: 2, focus: 4, defend: 9 } },
  American:          { label: 'American',          summary: 'Objective calculation and precise conversion.',           book: ['e2e4 c7c5', 'g1f3 d7d6', 'd2d4 c5d4'],         weights: { attack: 5, focus: 7, defend: 5 } },
  Attacking:         { label: 'Attacking',         summary: 'Initiative, open lines, and king-side pressure.',         book: ['e2e4 e7e5', 'f2f4'],                            weights: { attack: 9, focus: 6, defend: 2 } },
  Defensive:         { label: 'Defensive',         summary: 'Threat prevention first, then a timed counterattack.',   book: ['d2d4 g8f6', 'c2c4 e7e6'],                      weights: { attack: 2, focus: 4, defend: 9 } },
  Positional:        { label: 'Positional',        summary: 'Pawn structure, piece placement, gradual improvement.',  book: ['d2d4 d7d5', 'c2c4 e7e6', 'b1c3 g8f6'],         weights: { attack: 3, focus: 9, defend: 6 } },
  Dynamic:           { label: 'Dynamic',           summary: 'Active pieces, initiative, and persistent pressure.',     book: ['e2e4 c7c5', 'g1f3 d7d6', 'd2d4 c5d4'],         weights: { attack: 7, focus: 7, defend: 3 } },
}

export function schoolBookMove(school: ChessSchool, played: string[]): string | null {
  for (const line of schools[school].book) {
    const moves = line.split(' ')
    if (played.length < moves.length && played.every((m, i) => m === moves[i]))
      return moves[played.length]
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
  // Shared Promise - resolves once on 'readyok', safe to await multiple times.
  // Fixes the race condition where Universal mode called bestMove() before
  // the listener queue had registered a handler for 'readyok'.
  private readyPromise: Promise<void>
  private resolveReady!: () => void
  private listeners = new Set<(line: string) => void>()

  constructor() {
    this.readyPromise = new Promise<void>(resolve => { this.resolveReady = resolve })
    const root = import.meta.env.BASE_URL
    this.worker = new Worker(
      `${root}stockfish-18-lite-single.js#${root}stockfish-18-lite-single.wasm`
    )
    this.worker.onmessage = ({ data }) => this.handle(String(data))
    this.worker.onerror   = event => console.error('Stockfish worker error:', event.message)
    this.send('uci')
  }

  dispose() { this.worker.postMessage('quit'); this.worker.terminate() }

  private send(command: string) { this.worker.postMessage(command) }

  private handle(line: string) {
    if (line === 'uciok')   { this.send('isready'); return }
    if (line === 'readyok') { this.resolveReady(); return }
    this.listeners.forEach(listener => listener(line))
  }

  private until(match: (line: string) => boolean): Promise<string> {
    return new Promise(resolve => {
      const listen = (line: string) => {
        if (match(line)) { this.listeners.delete(listen); resolve(line) }
      }
      this.listeners.add(listen)
    })
  }

  async bestMove(fen: string, difficulty: Difficulty): Promise<string | null> {
    const { skill, time } = settings[difficulty]
    // await the shared Promise - already-resolved Promises return immediately
    // so concurrent calls and re-calls are all safe.
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

  /** Score a position from White's perspective. */
  async evaluate(fen: string, time = 120): Promise<number> {
    await this.readyPromise
    this.send('ucinewgame')
    this.send(`position fen ${fen}`)
    let score = 0
    const done = new Promise<void>(resolve => {
      const listen = (line: string) => {
        if (line.startsWith('info ') && line.includes(' score ')) {
          const cp = line.match(/\bscore cp (-?\d+)/)
          const mate = line.match(/\bscore mate (-?\d+)/)
          if (cp) score = Number(cp[1])
          if (mate) score = Math.sign(Number(mate[1])) * 100000
        }
        if (line.startsWith('bestmove ')) { this.listeners.delete(listen); resolve() }
      }
      this.listeners.add(listen)
    })
    this.send(`go movetime ${time}`)
    await done
    return score
  }

  async bestScore(fen: string, time = 120): Promise<number> {
    const score = await this.evaluate(fen, time)
    return -score
  }
}
