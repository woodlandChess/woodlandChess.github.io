import { describe, expect, it } from 'vitest'
import { parseInfoScore, StockfishClient, whitePov } from './stockfish'

/** A stand-in Web Worker that answers like Stockfish, but only AFTER the search time (as the real one does). */
class FakeWorker {
  onmessage: ((e: { data: string }) => void) | null = null
  onerror: ((e: unknown) => void) | null = null
  constructor(private searches: string[][]) {}
  private emit(line: string) { this.onmessage?.({ data: line }) }
  postMessage(cmd: string) {
    if (cmd === 'uci') setTimeout(() => this.emit('uciok'), 0)
    else if (cmd === 'isready') setTimeout(() => this.emit('readyok'), 0)
    else if (cmd.startsWith('go ')) {
      const lines = this.searches.shift() ?? ['bestmove (none)']
      lines.forEach((l, i) => setTimeout(() => this.emit(l), 5 + i))
    }
  }
  terminate() {}
}
const client = (...searches: string[][]) => new StockfishClient(new FakeWorker(searches) as unknown as Worker)

const WHITE_TO_MOVE = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'
const BLACK_TO_MOVE = 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1'

describe('StockfishClient.analyse (the real class, scripted engine)', () => {
  it('returns the score the engine reported DURING the search, not the starting value', async () => {
    const sf = client(['info depth 8 score cp 37 nodes 100 pv e2e4', 'info depth 9 score cp 52 nodes 200 pv e2e4', 'bestmove e2e4 ponder e7e5'])
    const r = await sf.analyse(WHITE_TO_MOVE, 100)
    expect(r).toMatchObject({ cp: 52, mate: null, best: 'e2e4' })
  })
  it('converts a Black-to-move score to White\'s point of view', async () => {
    const sf = client(['info depth 9 score cp -39 nodes 1 pv e7e5', 'bestmove e7e5'])
    expect((await sf.analyse(BLACK_TO_MOVE, 100)).cp).toBe(39)
  })
  it('ignores bound lines and keeps the last real score', async () => {
    const sf = client(['info depth 9 score cp 20 pv e2e4', 'info depth 10 score cp 99 upperbound pv e2e4', 'bestmove e2e4'])
    expect((await sf.analyse(WHITE_TO_MOVE, 100)).cp).toBe(20)
  })
  it('turns mate scores into large White-POV values with the mate distance', async () => {
    const sf = client(['info depth 20 score mate -3 pv a1a2', 'bestmove a1a2'])
    const r = await sf.analyse(BLACK_TO_MOVE, 100)                  // Black to move and being mated in 3 => White mates
    expect(r.mate).toBe(3)
    expect(r.cp).toBe(10000 - 30)
  })
  it('handles several searches in a row without mixing results up', async () => {
    const sf = client(['info depth 9 score cp 10 pv e2e4', 'bestmove e2e4'], ['info depth 9 score cp -200 pv e7e5', 'bestmove e7e5'])
    expect((await sf.analyse(WHITE_TO_MOVE, 50)).cp).toBe(10)
    expect((await sf.analyse(BLACK_TO_MOVE, 50)).cp).toBe(200)
  })
})

describe('MultiPV (second-best line)', () => {
  it('keeps the best line and the runner-up apart, both in White\'s point of view', async () => {
    const sf = client([
      'info depth 9 multipv 1 score cp -60 pv e7e5', 'info depth 9 multipv 2 score cp -20 pv d7d5',
      'info depth 10 multipv 1 score cp -70 pv e7e5', 'info depth 10 multipv 2 score cp -15 pv d7d5', 'bestmove e7e5',
    ])
    const r = await sf.analyse(BLACK_TO_MOVE, 100)                    // Black to move: scores flip
    expect(r.cp).toBe(70)
    expect(r.second).toBe(15)
  })
  it('reports no runner-up when there is only one legal move', async () => {
    const sf = client(['info depth 9 multipv 1 score cp 0 pv a1a2', 'bestmove a1a2'])
    expect((await sf.analyse(WHITE_TO_MOVE, 100)).second).toBeNull()
  })
})

describe('score helpers', () => {
  it('parses info lines', () => {
    expect(parseInfoScore('info depth 5 seldepth 7 multipv 1 score cp -29 nodes 2146')).toEqual({ cp: -29, mate: null, line: 1 })
    expect(parseInfoScore('info depth 5 multipv 2 score cp 12 nodes 2146')).toEqual({ cp: 12, mate: null, line: 2 })
    expect(parseInfoScore('info depth 5 score mate 4 nodes 1')).toEqual({ cp: 0, mate: 4, line: 1 })
    expect(parseInfoScore('info string NNUE evaluation using x')).toBeNull()
    expect(parseInfoScore('info depth 5 score cp 5 lowerbound')).toBeNull()
  })
  it('whitePov flips only when Black is to move', () => {
    expect(whitePov('x w - - 0 1', { cp: 40, mate: null }, null).cp).toBe(40)
    expect(whitePov('x b - - 0 1', { cp: 40, mate: null }, null).cp).toBe(-40)
  })
})
