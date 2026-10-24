import { describe, expect, it } from 'vitest'
import { Chess } from 'chess.js'
import { formatBalance, materialScore } from './material'

const play = (sans: string[], fen?: string) => {
  const c = new Chess(fen)
  const history = sans.map(m => c.move(m))
  return { c, history }
}

describe('materialScore', () => {
  it('starts at zero for both colours', () => {
    const { c } = play([])
    for (const side of ['w', 'b'] as const) expect(materialScore([], c, side)).toEqual({ you: 0, opponent: 0, balance: 0 })
  })
  it('counts what each side has captured, from the player\'s side', () => {
    // 1.e4 d5 2.exd5 Qxd5 : White won a pawn, Black won a pawn, level
    const { c, history } = play(['e4', 'd5', 'exd5', 'Qxd5'])
    expect(materialScore(history, c, 'w')).toEqual({ you: 1, opponent: 1, balance: 0 })
    expect(materialScore(history, c, 'b')).toEqual({ you: 1, opponent: 1, balance: 0 })
  })
  it('is signed for the player: the same position is + for one side and - for the other', () => {
    const { c, history } = play(['e4', 'd5', 'exd5', 'Nf6'])        // White is a pawn up
    const asWhite = materialScore(history, c, 'w'), asBlack = materialScore(history, c, 'b')
    expect(asWhite).toEqual({ you: 1, opponent: 0, balance: 1 })
    expect(asBlack).toEqual({ you: 0, opponent: 1, balance: -1 })
  })
  it('a player who is BEHIND sees a negative balance (the old display showed + for Black)', () => {
    const { c, history } = play(['e4', 'd5', 'exd5', 'Nf6', 'Bb5+', 'c6', 'dxc6', 'Qd5'])   // White: two pawns up
    const black = materialScore(history, c, 'b')
    expect(black.balance).toBeLessThan(0)
    expect(formatBalance(black.balance)).toMatch(/^−/)
    expect(materialScore(history, c, 'w').balance).toBeGreaterThan(0)
  })
  it('captured points never go down as the game goes on', () => {
    const sans = ['e4', 'd5', 'exd5', 'Qxd5', 'Nc3', 'Qa5', 'Bb5+', 'c6', 'Bxc6+', 'bxc6']
    const c = new Chess(); const history = sans.map(m => c.move(m))
    let last = 0
    for (let k = 0; k <= history.length; k++) {
      const v = new Chess(); history.slice(0, k).forEach(m => v.move(m.san))
      const s = materialScore(history.slice(0, k), v, 'w')
      expect(s.you).toBeGreaterThanOrEqual(last); last = s.you
    }
  })
  it('counts a promotion in the balance, not in the captured total', () => {
    const c = new Chess('8/4P3/8/8/8/8/k6K/8 w - - 0 1')
    const m = c.move('e8=Q')
    const s = materialScore([m], c, 'w')
    expect(s.you).toBe(0)
    expect(s.balance).toBe(9)
  })
  it('formats the balance with a real minus sign', () => {
    expect(formatBalance(2)).toBe('+2'); expect(formatBalance(-3)).toBe('−3'); expect(formatBalance(0)).toBe('0')
  })
})
