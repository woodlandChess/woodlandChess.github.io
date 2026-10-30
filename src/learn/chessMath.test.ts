import { describe, expect, it } from 'vitest'
import { expectedScore, formatEval, ratingChange, STARTING_MATERIAL, winChance } from './chessMath'

describe('Elo maths', () => {
  it('equal ratings expect half a point', () => {
    expect(expectedScore(1500, 1500)).toBeCloseTo(0.5, 6)
  })
  it('a 400 point edge expects about 91 percent', () => {
    expect(expectedScore(1900, 1500)).toBeCloseTo(0.909, 3)
    expect(expectedScore(1500, 1900)).toBeCloseTo(0.091, 3)
  })
  it('expected scores of the two players sum to one', () => {
    expect(expectedScore(1234, 1678) + expectedScore(1678, 1234)).toBeCloseTo(1, 10)
  })
  it('an even game moves half of K in either direction', () => {
    expect(ratingChange(1500, 1500, 1, 20)).toBeCloseTo(10, 6)
    expect(ratingChange(1500, 1500, 0, 20)).toBeCloseTo(-10, 6)
    expect(ratingChange(1500, 1500, 0.5, 20)).toBeCloseTo(0, 6)
  })
  it('beating a stronger player pays more than beating a weaker one', () => {
    expect(ratingChange(1500, 1700, 1, 20)).toBeGreaterThan(ratingChange(1500, 1300, 1, 20))
  })
})

describe('eval maths', () => {
  it('level position is 50 percent and the curve is symmetric', () => {
    expect(winChance(0)).toBeCloseTo(50, 6)
    expect(winChance(300) + winChance(-300)).toBeCloseTo(100, 6)
  })
  it('is monotonic and capped', () => {
    expect(winChance(100)).toBeGreaterThan(winChance(50))
    expect(winChance(5000)).toBeCloseTo(winChance(1000), 6)
    expect(winChance(1000)).toBeLessThan(100)
  })
  it('formats like an analysis panel', () => {
    expect(formatEval(150)).toBe('+1.50')
    expect(formatEval(-30)).toBe('-0.30')
    expect(formatEval(0)).toBe('0.00')
  })
  it('both sides start with 39 points of material', () => {
    expect(8 * 1 + 2 * 3 + 2 * 3 + 2 * 5 + 9).toBe(STARTING_MATERIAL)
  })
})
