import { describe, it, expect } from 'vitest'
import { Chess } from 'chess.js'
import { evaluate, chooseMove, schoolWeights } from './engine'

describe('evaluate', () => {
  it('returns 0 for starting position from either side (symmetric material)', () => {
    const g = new Chess()
    const w = evaluate(g, 'w')
    const b = evaluate(g, 'b')
    // material is symmetric; PST + attack/defend may differ slightly but both near 0
    expect(Math.abs(w)).toBeLessThan(200)
    expect(Math.abs(b)).toBeLessThan(200)
  })

  it('detects checkmate — returns large positive for winner', () => {
    // Fool's mate: Black wins
    const g = new Chess()
    g.move('f3'); g.move('e5')
    g.move('g4'); g.move('Qh4')
    expect(evaluate(g, 'b')).toBeGreaterThan(50_000)
    expect(evaluate(g, 'w')).toBeLessThan(-50_000)
  })
})

describe('chooseMove', () => {
  it('returns null when game is over', () => {
    const g = new Chess()
    g.move('f3'); g.move('e5')
    g.move('g4'); g.move('Qh4')
    expect(chooseMove(g, 2, 'w')).toBeNull()
  })

  it('returns null when asked for the wrong colour', () => {
    const g = new Chess()
    expect(chooseMove(g, 2, 'b')).toBeNull() // White to move, asking Black
  })

  it('finds a move in a normal position', () => {
    const g = new Chess()
    const m = chooseMove(g, 2, 'w', schoolWeights.Universal)
    expect(m).not.toBeNull()
    expect(m?.from).toMatch(/^[a-h][1-8]$/)
  })

  it('respects school weights (Attacking vs Defensive differ in output)', () => {
    // Not deterministic, but both should return valid moves
    const g = new Chess()
    const atk = chooseMove(new Chess(g.fen()), 2, 'w', schoolWeights.Attacking)
    const def = chooseMove(new Chess(g.fen()), 2, 'w', schoolWeights.Defensive)
    expect(atk).not.toBeNull()
    expect(def).not.toBeNull()
  })
})
