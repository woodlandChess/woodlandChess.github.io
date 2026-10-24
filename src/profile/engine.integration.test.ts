// @vitest-environment node
import { spawn, type ChildProcessWithoutNullStreams } from 'node:child_process'
import { existsSync } from 'node:fs'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { Chess } from 'chess.js'
import { parseInfoScore, whitePov, type PositionScore, type SideScore } from '../stockfish'
import { reviewGame, type ReviewEngine } from './analysis'
import type { ProfileGame } from './store'

/**
 * Runs the REAL Stockfish 18 (lite) from node_modules and feeds its raw output through
 * the same parsing/conversion code the browser uses. This is what proves the review is
 * right about whose point of view a score is in. Skipped when the engine is not installed.
 */
const ENGINE = 'node_modules/stockfish/bin/stockfish-18-lite-single.js'
const present = existsSync(ENGINE)

class NodeEngine implements ReviewEngine {
  private p!: ChildProcessWithoutNullStreams
  private listeners = new Set<(l: string) => void>()
  private buf = ''
  async start() {
    this.p = spawn('node', [ENGINE])
    this.p.stdout.on('data', d => {
      this.buf += d
      let i
      while ((i = this.buf.indexOf('\n')) >= 0) { const line = this.buf.slice(0, i).trim(); this.buf = this.buf.slice(i + 1); this.listeners.forEach(l => l(line)) }
    })
    const ok = this.until(l => l === 'uciok'); this.p.stdin.write('uci\n'); await ok
  }
  stop() { this.p?.kill() }
  private until(match: (l: string) => boolean) {
    return new Promise<string>((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('engine timeout')), 20000)
      const l = (line: string) => { if (match(line)) { clearTimeout(timer); this.listeners.delete(l); resolve(line) } }
      this.listeners.add(l)
    })
  }
  async newGame(multiPv = 1) { const r = this.until(l => l === 'readyok'); this.p.stdin.write(`setoption name MultiPV value ${multiPv}\nucinewgame\nisready\n`); await r }
  async analyse(fen: string, ms: number): Promise<PositionScore> {
    let latest: SideScore = { cp: 0, mate: null }
    let second: SideScore | null = null
    const sniff = (line: string) => { const s = parseInfoScore(line); if (s) { if (s.line === 2) second = s; else latest = s } }
    this.listeners.add(sniff)
    const done = this.until(l => l.startsWith('bestmove'))
    this.p.stdin.write(`position fen ${fen}\ngo movetime ${ms}\n`)
    const line = await done
    this.listeners.delete(sniff)
    const best = line.split(' ')[1]
    return whitePov(fen, latest, best && best !== '(none)' ? best : null, second)
  }
}

const game = (moves: string[], userColor: 'w' | 'b'): ProfileGame => {
  const c = new Chess(); const uci = moves.map(m => { const x = c.move(m); return `${x.from}${x.to}${x.promotion ?? ''}` })
  return { id: 'it', source: 'ai', playedAt: 0, white: 'W', black: 'B', userColor, result: 'unknown', moves: uci.join(' ') }
}

describe.skipIf(!present)('review with the real Stockfish', () => {
  const engine = new NodeEngine()
  beforeAll(async () => { await engine.start() }, 30000)
  afterAll(() => engine.stop())

  const ruy = ['e4', 'e5', 'Nf3', 'Nc6', 'Bb5', 'a6', 'Ba4', 'Nf6']

  it('a normal opening is accurate for both colours (the old code gave Black ~22%)', async () => {
    const asWhite = await reviewGame(game(ruy, 'w'), engine, { msPerPosition: 80 })
    const asBlack = await reviewGame(game(ruy, 'b'), engine, { msPerPosition: 80 })
    expect(asWhite.accuracy).toBeGreaterThan(85)
    expect(asBlack.accuracy).toBeGreaterThan(85)
    expect(asBlack.blunders + asBlack.mistakes).toBe(0)
    expect(asWhite.opening).toBe('Ruy Lopez')
    expect(asWhite.features.gap.n).toBeGreaterThan(0)              // the runner-up line was measured
    expect(asWhite.features.material.n).toBe(asWhite.features.moves)
  }, 60000)

  it('finds the only-move positions and counts tactical oversights (Opera Game, Black)', async () => {
    const opera = 'e4 e5 Nf3 d6 d4 Bg4 dxe5 Bxf3 Qxf3 dxe5 Bc4 Nf6 Qb3 Qe7 Nc3 c6 Bg5 b5 Nxb5 cxb5 Bxb5+ Nbd7 O-O-O Rd8 Rxd7 Rxd7 Rd1 Qe6 Bxd7+ Nxd7 Qb8+ Nxb8 Rd8#'.split(' ')
    const r = await reviewGame(game(opera, 'b'), engine, { msPerPosition: 100 })
    expect(r.features.critical.n).toBeGreaterThan(0)
    expect(r.features.critical.found).toBeLessThanOrEqual(r.features.critical.n)
    expect(r.features.tacticalErrors + r.features.quietErrors).toBeGreaterThan(0)
    expect(r.features.firstPawn).toBe('e7e5')
  }, 60000)

  it("fool's mate: White's f3/g4 are blunders, Black's Qh4# is not", async () => {
    const mate = ['f3', 'e5', 'g4', 'Qh4#']
    const asWhite = await reviewGame(game(mate, 'w'), engine, { msPerPosition: 100 })
    const asBlack = await reviewGame(game(mate, 'b'), engine, { msPerPosition: 100 })
    expect(asWhite.plies[2].grade).toBe('Blunder')                 // 2.g4??
    expect(asWhite.accuracy).toBeLessThan(60)
    expect(asBlack.blunders).toBe(0)
    expect(['Best', 'Good']).toContain(asBlack.plies[3].grade)     // the mating move is never graded as an error
    expect(asBlack.accuracy).toBeGreaterThan(85)
  }, 60000)
})
