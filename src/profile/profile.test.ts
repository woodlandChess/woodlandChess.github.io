import { describe, expect, it } from 'vitest'
import { Chess } from 'chess.js'
import type { PositionScore } from '../stockfish'
import { normalizeMoves, parseLichessNdjson, phaseOf, reviewGame, type ReviewEngine } from './analysis'
import { classifyOpening } from './openings'
import { gameAccuracy, gradeFor, moveAccuracy, winPercent } from './stats'
import { axesOf, matchSchools, metricsOf, summarizeStyle } from './style'
import { isValidReview, type ProfileGame } from './store'

/** Half-moves played so far, read from the FEN (a FEN carries no history). */
const plyOf = (fen: string) => { const f = fen.split(' '); return (Number(f[5]) - 1) * 2 + (f[1] === 'b' ? 1 : 0) }

/** An engine that answers from a script: White's-point-of-view centipawns by FEN. */
const scripted = (fn: (fen: string) => number | PositionScore): ReviewEngine => ({
  newGame: async () => {},
  analyse: async fen => { const v = fn(fen); return typeof v === 'number' ? { cp: v, mate: null, best: null } : v },
})
const game = (moves: string[], userColor: 'w' | 'b' = 'w'): ProfileGame => {
  const c = new Chess(); const uci = moves.map(m => { const x = c.move(m); return `${x.from}${x.to}${x.promotion ?? ''}` })
  return { id: 'g1', source: 'lichess', playedAt: 0, white: 'W', black: 'B', userColor, result: 'unknown', moves: uci.join(' ') }
}

describe('winning chances and accuracy', () => {
  it('is symmetric and bounded', () => {
    expect(winPercent(0)).toBeCloseTo(50)
    expect(winPercent(300) + winPercent(-300)).toBeCloseTo(100)
    expect(winPercent(100000)).toBeLessThan(100)
  })
  it('gives ~100% for no loss and falls with the loss', () => {
    expect(moveAccuracy(50, 50)).toBeGreaterThan(99)
    expect(moveAccuracy(50, 40)).toBeLessThan(moveAccuracy(50, 48))
    expect(moveAccuracy(50, 60)).toBeGreaterThan(99)          // improving your chances is never penalised
  })
  it('grades by winning-chance drop', () => {
    expect(gradeFor(0, true)).toBe('Best'); expect(gradeFor(1, false)).toBe('Good')
    expect(gradeFor(6, false)).toBe('Inaccuracy'); expect(gradeFor(11, false)).toBe('Mistake'); expect(gradeFor(20, false)).toBe('Blunder')
  })
  it('game accuracy is high for a flat game and low for a collapse', () => {
    const flat = Array(11).fill(50), colors = Array(10).fill(0).map((_, i) => (i % 2 ? 'b' : 'w')) as ('w' | 'b')[]
    expect(gameAccuracy(flat, colors, 'w')).toBeGreaterThan(97)
    const collapse = [50, 50, 50, 50, 50, 10, 10, 10, 10, 10, 10]
    expect(gameAccuracy(collapse, colors, 'w')).toBeLessThan(gameAccuracy(flat, colors, 'w'))
  })
})

describe('reviewGame: whose point of view', () => {
  const moves = ['e4', 'e5', 'Nf3', 'Nc6', 'Bb5', 'a6']
  it('a quiet game scores ~100% for BOTH colours (the old code graded Black moves as errors)', async () => {
    for (const side of ['w', 'b'] as const) {
      const r = await reviewGame(game(moves, side), scripted(() => 30))
      expect(r.accuracy).toBeGreaterThan(97)
      expect(r.blunders + r.mistakes + r.inaccuracies).toBe(0)
    }
  })
  it('a Black blunder (White suddenly +500) is a blunder for Black and not for White', async () => {
    const eng = scripted(fen => plyOf(fen) >= 4 ? 500 : 20)        // after Black's 2nd move
    const asBlack = await reviewGame(game(moves, 'b'), eng)
    const asWhite = await reviewGame(game(moves, 'w'), eng)
    expect(asBlack.blunders).toBe(1)
    expect(asBlack.accuracy).toBeLessThan(asWhite.accuracy)
    expect(asWhite.blunders).toBe(0)
  })
  it('a White blunder (eval falls to -500) is a blunder for White', async () => {
    const eng = scripted(fen => plyOf(fen) >= 5 ? -500 : 20)
    expect((await reviewGame(game(moves, 'w'), eng)).blunders).toBe(1)
  })
  it('delivering checkmate is not a blunder (the engine reports 0 for a mated position)', async () => {
    const mate = ['f3', 'e5', 'g4', 'Qh4#']
    const eng = scripted(fen => (new Chess(fen).isGameOver() ? 0 : -800))
    const r = await reviewGame(game(mate, 'b'), eng)
    expect(r.blunders).toBe(0)
    expect(r.plies.at(-1)!.grade).not.toBe('Blunder')
    expect(r.plies.at(-1)!.tags).toContain('Mate')
  })
  it('scores each position once (n + 1 searches for n moves)', async () => {
    let calls = 0
    await reviewGame(game(moves), scripted(() => (calls++, 0)))
    expect(calls).toBe(moves.length + 1)
  })
  it('marks the engine\'s own choice as Best and records the better move for costly ones', async () => {
    const eng: ReviewEngine = { newGame: async () => {}, analyse: async fen => ({ cp: plyOf(fen) === 0 ? 20 : -300, mate: null, best: 'd2d4' }) }
    const r = await reviewGame(game(['e4', 'e5']), eng)
    expect(r.plies[0].best).toBe('d4')
    expect(r.plies[0].grade).toBe('Blunder')
  })
  it('can be cancelled', async () => {
    const c = new AbortController(); c.abort()
    await expect(reviewGame(game(moves), scripted(() => 0), { signal: c.signal })).rejects.toThrow(/cancel/i)
  })
})

describe('phases and openings', () => {
  it('opening, middlegame, endgame', () => {
    expect(phaseOf(new Chess(), 0)).toBe('Opening')
    expect(phaseOf(new Chess(), 30)).toBe('Middlegame')
    expect(phaseOf(new Chess('8/5pk1/6p1/8/8/6P1/5PK1/3R4 w - - 0 40'), 60)).toBe('Endgame')
  })
  it('names openings by the longest matching line', () => {
    expect(classifyOpening(['e4', 'e5', 'Nf3', 'Nc6', 'Bb5', 'a6'])).toBe('Ruy Lopez')
    expect(classifyOpening(['e4', 'c5', 'Nf3', 'd6'])).toBe('Sicilian Defense')
    expect(classifyOpening(['d4', 'd5', 'c4', 'e6'])).toBe("Queen's Gambit Declined")
    expect(classifyOpening(['a3'])).toBe('Unclassified opening')
  })
})

describe('importing games', () => {
  const rec = (o: object) => JSON.stringify({ id: 'abc', speed: 'blitz', createdAt: 1, variant: 'standard', status: 'mate', winner: 'white', moves: 'e4 e5 Nf3', players: { white: { user: { name: 'Anahita' } }, black: { user: { name: 'Bob' } } }, ...o })
  it('finds the user case-insensitively, keeps result and opening name', () => {
    const [g] = parseLichessNdjson(rec({ opening: { name: 'King\'s Pawn Game' } }), 'anahita')
    expect(g.userColor).toBe('w'); expect(g.result).toBe('win'); expect(g.opening).toBe("King's Pawn Game"); expect(g.moves).toBe('e2e4 e7e5 g1f3')
  })
  it('skips variants, set-up positions, other players and one-move games', () => {
    expect(parseLichessNdjson([rec({ variant: 'chess960' }), rec({ initialFen: 'x' }), rec({ moves: 'e4' })].join('\n'), 'anahita')).toHaveLength(0)
    expect(parseLichessNdjson(rec({}), 'someoneelse')).toHaveLength(0)
  })
  it('normalises SAN and UCI and stops at an illegal move', () => {
    expect(normalizeMoves('e4 e5 Nf3')).toBe('e2e4 e7e5 g1f3')
    expect(normalizeMoves('e2e4 e7e5 g1f3')).toBe('e2e4 e7e5 g1f3')
    expect(normalizeMoves('e4 e5 Qh8')).toBe('e2e4 e7e5')
  })
})

describe('style read', () => {
  const mk = async (moves: string[], cp: (fen: string) => number, side: 'w' | 'b' = 'w') => reviewGame(game(moves, side), scripted(cp))
  it('needs analysed games', () => { expect(summarizeStyle([], []).school).toBeNull() })
  it('an aggressive game reads more attacking than a quiet one', async () => {
    const wild = await mk(['e4', 'e5', 'Nf3', 'd6', 'Bc4', 'Bg4', 'Nc3', 'g6', 'Nxe5', 'Bxd1', 'Bxf7+', 'Ke7', 'Nd5#'], () => 100)
    const calm = await mk(['d4', 'd5', 'c4', 'e6', 'Nc3', 'Nf6', 'Nf3', 'Be7', 'e3', 'O-O', 'Bd3', 'c5'], () => 20)
    const a = metricsOf([wild])!, b = metricsOf([calm])!
    expect(a.captureRate + a.checkRate).toBeGreaterThan(b.captureRate + b.checkRate)
    expect(axesOf({ ...a, moves: 400 }).attack).toBeGreaterThan(axesOf({ ...b, moves: 400 }).attack)
  })
  it('a small sample is pulled toward the middle', () => {
    const m = { moves: 400, accuracy: 95, captureRate: 0.3, checkRate: 0.14, pressureRate: 0.35, sacrificesPer100: 3, tradeRate: 0.8, castledShare: 1, worseAccuracy: 90, betterAccuracy: 95, phaseAccuracy: {}, squandered: 0, games: 10 }
    expect(axesOf({ ...m, moves: 400 }).attack).toBeGreaterThan(9)
    expect(Math.abs(axesOf({ ...m, moves: 15 }).attack - 5)).toBeLessThan(1.5)
  })
  it('ranks schools from the three axes and ties each to the right player', () => {
    const top = (a: number, f: number, d: number) => matchSchools({ attack: a, focus: f, defend: d }, [], [])[0]
    expect(top(9, 6, 2).school).toBe('Attacking'); expect(top(9, 6, 2).players).toBe('Mikhail Tal')
    expect(top(2, 4, 9).players).toMatch(/Petrosian|Portisch/)
    expect(top(5, 5, 5).school).toBe('Universal'); expect(top(5, 5, 5).players).toBe('Magnus Carlsen')
    const all = matchSchools({ attack: 5, focus: 5, defend: 5 }, [], [])
    expect(all.every(m => m.match >= 0 && m.match <= 100)).toBe(true)
    expect(all.find(m => m.school === 'Classical German')!.players).toBe('Siegbert Tarrasch')
    expect(all.find(m => m.school === 'Hungarian')!.players).toBe('Lajos Portisch')
  })
})

describe('saved data is validated (a bad record must never crash the page)', () => {
  it('accepts a real review and rejects partial or old ones', async () => {
    const real = await reviewGame(game(['e4', 'e5', 'Nf3']), scripted(() => 0))
    expect(isValidReview(real)).toBe(true)
    const { features, ...noFeatures } = real
    void features
    expect(isValidReview(noFeatures)).toBe(false)               // the shape that crashed the page
    expect(isValidReview({ ...real, version: 2 })).toBe(false)
    expect(isValidReview({ ...real, wins: [50] })).toBe(false)
    expect(isValidReview(null)).toBe(false)
    expect(isValidReview({ gameId: 'x', version: 3 })).toBe(false)
  })
  it('summarising tolerates a review without features', () => {
    expect(summarizeStyle([], [{ gameId: 'x' } as never]).school).toBeNull()
  })
})
