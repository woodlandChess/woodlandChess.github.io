import { describe, expect, it } from 'vitest'
import { Chess } from 'chess.js'
import { chooseMove, gameStatus, moveSan } from './engine'

describe('game rules and AI', () => {
  it('rejects illegal moves without changing position', () => {
    const game = new Chess(); const fen = game.fen()
    expect(moveSan(game, 'e2', 'e5')).toBeNull(); expect(game.fen()).toBe(fen)
  })
  it('recognizes checkmate', () => {
    const game = new Chess('7k/6Q1/6K1/8/8/8/8/8 b - - 0 1')
    expect(game.isCheckmate()).toBe(true); expect(gameStatus(game, 'w')).toContain('You win')
  })
  it('recognizes stalemate', () => {
    const game = new Chess('7k/5Q2/6K1/8/8/8/8/8 b - - 0 1')
    expect(game.isStalemate()).toBe(true); expect(gameStatus(game, 'w')).toContain('stalemate')
  })
  it('makes a legal non-mutating computer move', () => {
    const game = new Chess(); game.move('e4'); const before = game.fen()
    const candidate = chooseMove(game, 1, 'b')
    expect(candidate).not.toBeNull(); expect(game.moves()).toContain(candidate!.san); expect(game.fen()).toBe(before)
  })
})
