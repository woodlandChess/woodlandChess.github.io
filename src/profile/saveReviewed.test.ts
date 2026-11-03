import { beforeEach, describe, expect, it, vi } from 'vitest'
import { readProfile, REVIEW_VERSION, saveReviewedGame, type GameReview, type ProfileGame } from './store'

const mem = () => {
  const m = new Map<string, string>()
  return { getItem: (k: string) => m.get(k) ?? null, setItem: (k: string, v: string) => void m.set(k, v), removeItem: (k: string) => void m.delete(k) }
}
const tally = { sum: 1, n: 1 }
const game = (id: string): ProfileGame => ({ id, source: 'lichess', playedAt: 1000, white: 'me', black: 'opp', userColor: 'w', result: 'win', moves: 'e2e4 e7e5' })
const review = (gameId: string, accuracy = 80): GameReview => ({
  gameId, version: REVIEW_VERSION, accuracy, opponentAccuracy: 70, blunders: 0, mistakes: 0, inaccuracies: 0, brilliant: 0, great: 0, opening: 'Test',
  plies: [{ ply: 1, san: 'e4', uci: 'e2e4', color: 'w', grade: 'Best', loss: 0, winLoss: 0, phase: 'Opening', tags: [] }], wins: [50, 52],
  features: {
    moves: 1, captures: 0, checks: 0, trades: 0, pressure: 0, sacrifices: 0, castledPly: 0, worse: tally, better: tally,
    byPhase: { Opening: tally, Middlegame: tally, Endgame: tally }, squandered: false, firstMoves: ['e2e4'], firstPawn: 'e2e4',
    material: tally, gap: tally, critical: { n: 0, found: 0 }, tacticalErrors: 0, quietErrors: 0,
  },
})

describe('saving a game together with its review', () => {
  beforeEach(() => { vi.stubGlobal('localStorage', mem()) })

  it('adds an online game that was analysed right after it ended to the Analyze tab', () => {
    expect(readProfile().games).toHaveLength(0)
    saveReviewedGame(game('abcd1234'), review('abcd1234'))
    const p = readProfile()
    expect(p.games.map(g => g.id)).toEqual(['abcd1234'])
    expect(p.reviews.map(r => r.gameId)).toEqual(['abcd1234'])
  })

  it('does not duplicate the game when it is imported later, and replaces an older review', () => {
    saveReviewedGame(game('abcd1234'), review('abcd1234', 60))
    saveReviewedGame(game('abcd1234'), review('abcd1234', 90))
    const p = readProfile()
    expect(p.games).toHaveLength(1)
    expect(p.reviews).toHaveLength(1)
    expect(p.reviews[0].accuracy).toBe(90)
  })

  it('keeps everything else in the profile', () => {
    saveReviewedGame(game('one'), review('one'))
    saveReviewedGame(game('two'), review('two'))
    const p = readProfile()
    expect(p.games.map(g => g.id).sort()).toEqual(['one', 'two'])
    expect(p.reviews).toHaveLength(2)
  })
})
