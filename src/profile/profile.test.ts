import { describe, expect, it } from 'vitest'
import { Chess } from 'chess.js'
import type { PositionScore } from '../stockfish'
import { normalizeMoves, parseLichessNdjson, phaseOf, reviewGame, type ReviewEngine } from './analysis'
import { classifyOpening } from './openings'
import { gameAccuracy, gradeFor, moveAccuracy, winPercent } from './stats'
import { axesOf, FAMOUS, metricsOf, summarizeStyle, type StyleMetrics } from './style'
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
  it('refuses to grade a game when the engine returns the same score for every position', async () => {
    const long = ['e4', 'e5', 'Nf3', 'Nc6', 'Bb5', 'a6', 'Ba4', 'Nf6', 'O-O', 'Be7', 'Re1', 'b5']
    await expect(reviewGame(game(long), scripted(() => 0))).rejects.toThrow(/usable scores/)
  })
  it('refuses a game with no readable moves', async () => {
    await expect(reviewGame({ ...game(['e4', 'e5']), moves: 'zz99' }, scripted(() => 0))).rejects.toThrow(/no readable moves/)
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
    const wild = await mk(['e4', 'e5', 'Nf3', 'd6', 'Bc4', 'Bg4', 'Nc3', 'g6', 'Nxe5', 'Bxd1', 'Bxf7+', 'Ke7', 'Nd5#'], fen => 100 + plyOf(fen))
    const calm = await mk(['d4', 'd5', 'c4', 'e6', 'Nc3', 'Nf6', 'Nf3', 'Be7', 'e3', 'O-O', 'Bd3', 'c5'], fen => 20 + plyOf(fen))
    const a = metricsOf([wild])!, b = metricsOf([calm])!
    expect(a.captureRate + a.checkRate).toBeGreaterThan(b.captureRate + b.checkRate)
    expect(axesOf({ ...a, moves: 400 }).attack).toBeGreaterThan(axesOf({ ...b, moves: 400 }).attack)
  })
  it('a small sample is pulled toward the middle', () => {
    const m: StyleMetrics = { moves: 400, accuracy: 95, captureRate: 0.3, checkRate: 0.14, pressureRate: 0.35, sacrificesPer100: 3, tradeRate: 0.8, castledShare: 1, worseAccuracy: 90, betterAccuracy: 95, phaseAccuracy: {}, squandered: 0, games: 10,
      criticalShare: 0.3, criticalN: 40, criticalSolved: 0.9, meanGap: 13, avgMaterial: 30, avgCastlePly: 10, endgameShare: 0.35, endgameEdge: 10, openShare: 1, tacticalErrors: 0, quietErrors: 0 }
    expect(axesOf({ ...m, moves: 400 }).attack).toBeGreaterThan(9)
    expect(Math.abs(axesOf({ ...m, moves: 15 }).attack - 5)).toBeLessThan(1.5)
  })
  it('the school list comes from the player list, so they cannot disagree', async () => {
    const { matchPlayers, schoolsFromPlayers } = await import('./style')
    const players = matchPlayers({ attack: 10, sharpness: 10, simplify: 1.5, risk: 10, safety: 2.5, endgame: 4.5, open: 9 })
    const schoolList = schoolsFromPlayers(players)
    expect(schoolList[0].school).toBe(players[0].player.school)
    expect(schoolList[0].match).toBe(players[0].match)
    expect(new Set(schoolList.map(s => s.school)).size).toBe(schoolList.length)
  })
  it('ties each school to the player it is named for', () => {
    expect(FAMOUS['Classical German'].players).toBe('Siegbert Tarrasch')
    expect(FAMOUS.Hungarian.players).toBe('Lajos Portisch')
    expect(FAMOUS.Universal.players).toBe('Magnus Carlsen')
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

describe('player roster and matching', () => {
  it('has a sane roster: unique names, every axis within 0-10, all ten schools represented', async () => {
    const { PLAYERS, AXES } = await import('./players')
    expect(PLAYERS.length).toBeGreaterThanOrEqual(200)
    expect(new Set(PLAYERS.map(p => p.name)).size).toBe(PLAYERS.length)
    for (const p of PLAYERS) {
      expect(p.axes).toHaveLength(AXES.length)
      for (const v of p.axes) { expect(v).toBeGreaterThanOrEqual(0); expect(v).toBeLessThanOrEqual(10) }
    }
    const { schools } = await import('../stockfish')
    expect(new Set(PLAYERS.map(p => p.school))).toEqual(new Set(Object.keys(schools)))
  })
  it('every player is their own closest match (the roster separates people)', async () => {
    const { PLAYERS, playerVector } = await import('./players')
    const { matchPlayers } = await import('./style')
    for (const p of PLAYERS) {
      const top = matchPlayers(playerVector(p))[0]
      expect(top.match).toBe(100)
    }
  })
  it('no two players are near-duplicates, so every ranking is meaningful', async () => {
    const { PLAYERS } = await import('./players')
    for (let i = 0; i < PLAYERS.length; i++) for (let j = i + 1; j < PLAYERS.length; j++) {
      const a = PLAYERS[i].axes, b = PLAYERS[j].axes
      const d = Math.sqrt(a.reduce((t, x, k) => t + (x - b[k]) ** 2, 0) / a.length)
      expect(d, `${PLAYERS[i].name} vs ${PLAYERS[j].name}`).toBeGreaterThanOrEqual(0.25)
    }
  })
  it('every school has enough players, and every entry is well formed', async () => {
    const { PLAYERS } = await import('./players')
    const count = new Map<string, number>()
    for (const p of PLAYERS) {
      count.set(p.school, (count.get(p.school) ?? 0) + 1)
      expect(p.years).toMatch(/^\d{4}–(\d{4})?$/)
      expect(p.known.length).toBeGreaterThan(8)
    }
    for (const [school, n] of count) expect(n, school).toBeGreaterThanOrEqual(5)
  })
  it('axis weights stay bounded around the base weights', async () => {
    const { axisWeights } = await import('./style')
    const w = axisWeights()
    for (const v of Object.values(w)) { expect(v).toBeGreaterThan(0.3); expect(v).toBeLessThan(1.8) }
  })
  it('a thin sample gives softer matches than a solid one, without changing the order', async () => {
    const { matchPlayers } = await import('./style')
    const you = { attack: 7, sharpness: 6.5, simplify: 3.5, risk: 6, safety: 4, endgame: 5, open: 8 }
    const solid = matchPlayers(you, undefined, { moves: 400 })
    const thin = matchPlayers(you, undefined, { moves: 30 })
    expect(thin[0].match).toBeGreaterThanOrEqual(solid[0].match)
    expect(thin[0].player.name).toBe(solid[0].player.name)
    expect(solid[0].match).toBeGreaterThan(solid[40].match)
  })
  it('a Tal-like fingerprint matches Tal and a Petrosian-like one matches Petrosian', async () => {
    const { matchPlayers } = await import('./style')
    const tal = matchPlayers({ attack: 10, sharpness: 10, simplify: 1.5, risk: 10, safety: 2.5, endgame: 4.5, open: 9 })[0]
    const pet = matchPlayers({ attack: 2.5, sharpness: 2.5, simplify: 4, risk: 2, safety: 9.5, endgame: 8, open: 3 })[0]
    expect(tal.player.name).toBe('Mikhail Tal')
    expect(pet.player.name).toBe('Tigran Petrosian')
  })
  it('small differences change the order (the match is graded, not bucketed)', async () => {
    const { matchPlayers } = await import('./style')
    const a = matchPlayers({ attack: 5, sharpness: 5, simplify: 5, risk: 5, safety: 5, endgame: 5, open: 5 })
    const b = matchPlayers({ attack: 5.6, sharpness: 5, simplify: 5, risk: 5, safety: 5, endgame: 5, open: 5 })
    const scoreOf = (m: typeof a, name: string) => m.find(x => x.player.name === name)!.match
    expect(scoreOf(a, 'Anatoly Karpov')).not.toBe(scoreOf(b, 'Anatoly Karpov'))
    expect(a[0].match).toBeGreaterThan(a[10].match)
  })
  it('reports why: the axes you share and the one you differ most on', async () => {
    const { matchPlayers } = await import('./style')
    const m = matchPlayers({ attack: 9.5, sharpness: 9.5, simplify: 2, risk: 9, safety: 3, endgame: 9.5, open: 9 })[0]
    expect(m.alike).toHaveLength(2)
    expect(m.differs).toBeTruthy()
  })
})

describe('openness and tactics', () => {
  it('classifies first pawn moves', async () => {
    const { openness } = await import('./style')
    expect(openness('e2e4', 'w')).toBe(1)
    expect(openness('d2d4', 'w')).toBeLessThan(0.5)
    expect(openness('c7c5', 'b')).toBeGreaterThan(0.8)
    expect(openness('', 'w')).toBeNull()
  })
})

describe('Brilliant and Great moves', () => {
  /** An engine that names a best move and a runner-up at chosen plies (White's point of view; everything else is even). */
  const picky = (spec: Record<number, { best: string; second: number }>, cp = 30): ReviewEngine => ({
    newGame: async () => {},
    analyse: async fen => { const s = spec[plyOf(fen)]; return { cp: cp + (plyOf(fen) % 3), mate: null, best: s?.best ?? null, second: s ? s.second : null } },
  })
  const fried = ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4', 'Nf6', 'Ng5', 'd5', 'exd5', 'Nxd5', 'Nxf7', 'Kxf7']

  it('a best move that gives up a knight for a pawn, clearly ahead of the alternatives, is Brilliant', async () => {
    const r = await reviewGame(game(fried, 'w'), picky({ 10: { best: 'g5f7', second: -60 } }))
    const sac = r.plies[10]
    expect(sac.san).toBe('Nxf7')
    expect(sac.grade).toBe('Brilliant')
    expect(r.brilliant).toBe(1)
  })
  it('the same sacrifice is not Brilliant when the position was already won', async () => {
    const r = await reviewGame(game(fried, 'w'), picky({ 10: { best: 'g5f7', second: -60 } }, 900))
    expect(r.plies[10].grade).not.toBe('Brilliant')
  })
  it('a sacrifice that is NOT the engine\'s choice and loses chances is no Brilliancy', async () => {
    const eng: ReviewEngine = { newGame: async () => {}, analyse: async fen => ({ cp: plyOf(fen) >= 11 ? -400 : 30, mate: null, best: plyOf(fen) === 10 ? 'b1c3' : null, second: plyOf(fen) === 10 ? 20 : null }) }
    const r = await reviewGame(game(fried, 'w'), eng)
    expect(r.plies[10].grade).toBe('Blunder')
  })
  it('the only move that held up is Great', async () => {
    const r = await reviewGame(game(['e4', 'e5', 'Nf3', 'Nc6'], 'w'), picky({ 2: { best: 'g1f3', second: -400 } }))
    expect(r.plies[2].grade).toBe('Great')
    expect(r.great).toBe(1)
  })
  it('an obvious recapture is not Great even when it is the only move', async () => {
    const r = await reviewGame(game(['e4', 'd5', 'exd5', 'Qxd5'], 'b'), picky({ 3: { best: 'd8d5', second: 300 } }, 0))
    expect(r.plies[3].san).toBe('Qxd5')
    expect(r.plies[3].grade).not.toBe('Great')
  })
})
