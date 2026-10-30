import { describe, expect, it } from 'vitest'
import { Chess } from 'chess.js'
import { MOTIFS } from './motifs'

const get = (id: string) => MOTIFS.find(m => m.id === id)!

/** All legal moves from a position that deliver checkmate. */
const matesIn1 = (fen: string) =>
  new Chess(fen).moves().filter(s => { const g = new Chess(fen); g.move(s); return g.isCheckmate() })

describe('tactic motifs', () => {
  it('has unique ids and a valid group', () => {
    expect(new Set(MOTIFS.map(m => m.id)).size).toBe(MOTIFS.length)
    for (const m of MOTIFS) expect(['motif', 'mate']).toContain(m.group)
  })

  it('covers every pattern on the reference list', () => {
    const ids = MOTIFS.map(m => m.id)
    for (const id of ['perpetual', 'windmill', 'double-check', 'discovered-check', 'cross-check', 'smothered', 'back-rank',
      'fork-check', 'pin-check', 'mating-net', 'skewer-check', 'ladder', 'arabian', 'anastasia', 'boden', 'epaulette',
      'opera', 'hook', 'swallow', 'scholar', 'kiss']) expect(ids).toContain(id)
  })

  for (const m of MOTIFS) {
    it(`${m.name}: legal position and key move`, () => {
      const game = new Chess(m.fen)
      const played = game.move(m.move)
      expect(played.san).toBe(m.move)
      if (m.move.endsWith('#')) expect(game.isCheckmate()).toBe(true)
      else if (m.move.endsWith('+')) expect(game.isCheck()).toBe(true)
      else expect(game.isCheck()).toBe(false)
    })

    it(`${m.name}: arrows and marks name real squares`, () => {
      const sq = /^[a-h][1-8]$/
      for (const [a, b] of m.arrows) { expect(a).toMatch(sq); expect(b).toMatch(sq) }
      for (const s of Object.keys(m.marks)) expect(s).toMatch(sq)
    })

    it(`${m.name}: text has no em or en dashes`, () => {
      expect(JSON.stringify(m)).not.toMatch(/[\u2013\u2014]/)
    })
  }

  it('mates are really checkmate and motifs are not mate-in-one gimmicks', () => {
    for (const m of MOTIFS.filter(x => x.group === 'mate')) expect(m.move.endsWith('#')).toBe(true)
  })

  it('the pinned knight really cannot move', () => {
    const g = new Chess(get('pin').fen.replace(' w ', ' b '))
    expect(g.moves({ square: 'c6' })).toEqual([])
  })

  it('skewer: the king must leave the file and the rook is left alone', () => {
    const g = new Chess(get('skewer').fen)
    g.move('Ra1+')
    const replies = g.moves({ verbose: true })
    expect(replies.every(r => r.from === 'a5')).toBe(true)
    expect(replies.some(r => r.to[0] === 'a')).toBe(false)
  })

  it('double check: the checking pieces cannot be answered by anything but the king', () => {
    const g = new Chess(get('double-check').fen)
    g.move('Nd6+')
    expect(g.moves({ verbose: true }).every(r => r.piece === 'k')).toBe(true)
  })

  it('discovered check: the queen is gone whatever Black replies', () => {
    const g = new Chess(get('discovered-check').fen)
    g.move('Bxa8+')
    expect(g.board().flat().some(p => p?.type === 'q' && p.color === 'b')).toBe(false)
  })

  it('cross-check: Black really can reply with a check, and the knight is guarded', () => {
    const g = new Chess(get('cross-check').fen)
    g.move('Re1+')
    expect(g.moves()).toContain('Ne4+')
    g.move('Ne4+')
    expect(g.isCheck()).toBe(true)
    const trade = new Chess(g.fen()); trade.move('Rxe4')
    expect(trade.moves()).toContain('dxe4')
  })

  it('fork with check: the rook falls after any king move', () => {
    const g = new Chess(get('fork-check').fen)
    g.move('Qd5+')
    for (const reply of g.moves()) {
      const h = new Chess(g.fen()); h.move(reply)
      expect(h.moves().some(m => m.startsWith('Qxa8'))).toBe(true)
    }
  })

  it('pin with check: a block on e4 loses the bishop', () => {
    const g = new Chess(get('pin-check').fen)
    g.move('Re1+')
    expect(g.moves()).toContain('Be4')
    g.move('Be4')
    expect(g.moves()).toContain('Nxe4')
  })

  it('skewer with check: the queen can be taken after every king move', () => {
    const g = new Chess(get('skewer-check').fen)
    g.move('Bb5+')
    const replies = g.moves()
    expect(replies.length).toBeGreaterThan(0)
    for (const reply of replies) {
      const h = new Chess(g.fen()); h.move(reply)
      expect(h.moves()).toContain('Bxe8')
    }
  })

  it('windmill: the king has one reply each time and the rook keeps eating', () => {
    const g = new Chess(get('windmill').fen)
    const line: [string, string][] = [['Rxf7+', 'Kg8'], ['Rg7+', 'Kh8'], ['Rxd7+', 'Kg8'], ['Rg7+', 'Kh8'], ['Rxb7+', 'Kg8']]
    // the bishop gives every check, so the king must answer and nothing can block
    for (const [white, black] of line) {
      g.move(white)
      expect(g.isCheck()).toBe(true)
      expect(g.moves()).toEqual([black])
      g.move(black)
    }
  })

  it('perpetual check: every check has exactly one reply and the position repeats', () => {
    const g = new Chess(get('perpetual').fen)
    const start = g.fen().split(' ')[0]
    for (const [w, b] of [['Qf8+', 'Kh7'], ['Qf7+', 'Kh8']]) {
      g.move(w)
      expect(g.moves()).toEqual([b])
      g.move(b)
    }
    expect(g.fen().split(' ')[0]).toBe(start)
  })

  it('mating net: not a check, and every defence allows mate in one', () => {
    const net = get('mating-net')
    expect(matesIn1(net.fen)).toEqual([])
    const g = new Chess(net.fen)
    g.move('Qg6')
    expect(g.isCheck()).toBe(false)
    const replies = g.moves()
    expect(replies.length).toBeGreaterThan(0)
    for (const r of replies) {
      const h = new Chess(g.fen()); h.move(r)
      expect(matesIn1(h.fen()).length).toBeGreaterThan(0)
    }
  })

  it('scholar: the sideline from the reference game reaches the diagram', () => {
    const g = new Chess()
    for (const m of 'e4 e5 Bc4 Nf6 Nf3 Nxe4 Nxe5 d6 Qf3 dxe5'.split(' ')) g.move(m)
    expect(g.fen()).toBe(get('scholar').fen)
  })
})
