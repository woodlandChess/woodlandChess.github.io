import { describe, expect, it } from 'vitest'
import { Chess } from 'chess.js'
import { diffMoves, squareAt, type PieceGrid } from './boardAnimation'

const grid = (c: Chess) => c.board() as PieceGrid
const names = (slides: ReturnType<typeof diffMoves>) =>
  (slides ?? []).map(s => `${squareAt(s.from[0], s.from[1])}-${squareAt(s.to[0], s.to[1])}`)

describe('squareAt', () => {
  it('maps grid cells to real square names, never mirrored', () => {
    expect(squareAt(0, 0)).toBe('a8')
    expect(squareAt(7, 7)).toBe('h1')
    expect(squareAt(6, 4)).toBe('e2')
  })
})

describe('diffMoves capture flag (only captures vibrate the board)', () => {
  const flag = (fen: string, san: string) => {
    const c = new Chess(fen); const before = grid(c); c.move(san)
    return (diffMoves(before, grid(c)) ?? []).map(s => s.capture)
  }
  it('is false for quiet moves, castling and promotion', () => {
    expect(flag(new Chess().fen(), 'e4')).toEqual([false])
    expect(flag('r3k2r/8/8/8/8/8/8/R3K2R w KQkq - 0 1', 'O-O')).toEqual([false, false])
    expect(flag('8/4P3/8/8/8/8/k6K/8 w - - 0 1', 'e8=Q')).toEqual([false])
  })
  it('is true for captures, en passant and capturing promotions', () => {
    expect(flag('rnbqkbnr/ppp1pppp/8/3p4/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2', 'exd5')).toEqual([true])
    expect(flag('rnbqkbnr/ppp1p1pp/8/3pPp2/8/8/PPPP1PPP/RNBQKBNR w KQkq f6 0 3', 'exf6')).toEqual([true])
    expect(flag('1n6/P7/8/8/8/8/k6K/8 w - - 0 1', 'axb8=Q')).toEqual([true])
  })
})

describe('diffMoves', () => {
  it('finds a plain move (same result whichever side the board is viewed from)', () => {
    const c = new Chess(); const before = grid(c)
    c.move('e4')
    expect(names(diffMoves(before, grid(c)))).toEqual(['e2-e4'])
  })
  it('finds the opponent move as Black', () => {
    const c = new Chess(); c.move('e4'); const before = grid(c)
    c.move('Nf6')
    expect(names(diffMoves(before, grid(c)))).toEqual(['g8-f6'])
  })
  it('finds a capture', () => {
    const c = new Chess(); ;['e4', 'd5'].forEach(m => c.move(m)); const before = grid(c)
    c.move('exd5')
    expect(names(diffMoves(before, grid(c)))).toEqual(['e4-d5'])
  })
  it('finds both pieces when castling', () => {
    const c = new Chess('r3k2r/8/8/8/8/8/8/R3K2R w KQkq - 0 1'); const before = grid(c)
    c.move('O-O')
    expect(names(diffMoves(before, grid(c))).sort()).toEqual(['e1-g1', 'h1-f1'])
  })
  it('animates a promotion from the pawn square', () => {
    const c = new Chess('8/4P3/8/8/8/8/k6K/8 w - - 0 1'); const before = grid(c)
    c.move('e8=Q')
    expect(names(diffMoves(before, grid(c)))).toEqual(['e7-e8'])
  })
  it('does not animate unchanged positions or big jumps (resync / reconnect)', () => {
    const c = new Chess(); const start = grid(c)
    expect(diffMoves(start, grid(c))).toBeNull()
    ;['e4', 'e5', 'Nf3', 'Nc6', 'Bb5'].forEach(m => c.move(m))
    expect(diffMoves(start, grid(c))).toBeNull()
  })
})
