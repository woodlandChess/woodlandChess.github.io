import { describe, expect, it } from 'vitest'
import { Chess } from 'chess.js'
import { MOTIFS } from './motifs'

describe('tactic motifs', () => {
  it('has unique ids', () => {
    expect(new Set(MOTIFS.map(m => m.id)).size).toBe(MOTIFS.length)
  })

  for (const m of MOTIFS) {
    it(`${m.name}: legal position and key move`, () => {
      const game = new Chess(m.fen)
      const played = game.move(m.move)
      expect(played.san).toBe(m.move)
      if (m.move.endsWith('#')) expect(game.isCheckmate()).toBe(true)
      else if (m.move.endsWith('+')) expect(game.isCheck()).toBe(true)
    })

    it(`${m.name}: arrows and marks name real squares`, () => {
      const sq = /^[a-h][1-8]$/
      for (const [a, b] of m.arrows) { expect(a).toMatch(sq); expect(b).toMatch(sq) }
      for (const s of Object.keys(m.marks)) expect(s).toMatch(sq)
    })
  }

  it('the pinned knight really cannot move', () => {
    const pin = MOTIFS.find(m => m.id === 'pin')!
    const g = new Chess(pin.fen.replace(' w ', ' b '))
    expect(g.moves({ square: 'c6' })).toEqual([])
  })

  it('the skewer leaves the rook behind the king', () => {
    const sk = MOTIFS.find(m => m.id === 'skewer')!
    const g = new Chess(sk.fen)
    g.move('Ra1+')
    const replies = g.moves({ verbose: true })
    expect(replies.every(r => r.from === 'a5')).toBe(true)
    expect(replies.some(r => r.to[0] === 'a')).toBe(false)   // nothing stays on the a-file
  })
})
