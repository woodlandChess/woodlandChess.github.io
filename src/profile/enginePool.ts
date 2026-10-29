import { StockfishClient, type PositionScore } from '../stockfish'
import type { ReviewEngine } from './analysis'

/** Deep review: every position is searched to this depth (same quality on every device); the time is only a cap for slow ones. */
export const REVIEW_DEPTH = 18
export const REVIEW_MAX_MS = 3000

/**
 * How many engines to run side by side. Each one is a small single-threaded WebAssembly build,
 * so the limit is the device's cores, not memory: half of them (leaving the page responsive), at most 4.
 */
export function defaultEngineCount(): number {
  const cores = typeof navigator !== 'undefined' ? navigator.hardwareConcurrency || 2 : 2
  return Math.max(1, Math.min(4, Math.floor(cores / 2)))
}

/** Several Stockfish workers behind one ReviewEngine. A "lane" always goes to the same worker, so its hash table stays warm. */
export class EnginePool implements ReviewEngine {
  readonly size: number
  private readonly clients: StockfishClient[]

  constructor(size = defaultEngineCount(), factory: () => StockfishClient = () => new StockfishClient()) {
    this.size = Math.max(1, size)
    this.clients = Array.from({ length: this.size }, factory)
  }

  async newGame(multiPv = 1): Promise<void> {
    await Promise.all(this.clients.map(c => c.newGame(multiPv)))
  }

  analyse(fen: string, ms: number, opts: { depth?: number; lane?: number } = {}): Promise<PositionScore> {
    return this.clients[(opts.lane ?? 0) % this.size].analyse(fen, ms, opts.depth)
  }

  dispose(): void { this.clients.forEach(c => c.dispose()) }
}
