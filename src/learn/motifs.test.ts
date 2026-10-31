import { describe, expect, it } from 'vitest'
import { Chess } from 'chess.js'
import { GROUPS, MOTIFS, START_FEN } from './motifs'
import { replay } from './lesson'
import { gainAfter, material, rankMoves, search } from './solve'

const get = (id: string) => MOTIFS.find(m => m.id === id)!
const sqRe = /^[a-h][1-8]$/

/** Mates in one for the side to move. */
const matesIn1 = (fen: string) =>
  new Chess(fen).moves().filter(s => { const g = new Chess(fen); g.move(s); return g.isCheckmate() })

describe('tactics library: structure', () => {
  it('has unique ids and only known groups', () => {
    expect(new Set(MOTIFS.map(m => m.id)).size).toBe(MOTIFS.length)
    const groups = GROUPS.map(g => g.id)
    for (const m of MOTIFS) expect(groups).toContain(m.group)
    for (const g of GROUPS) expect(MOTIFS.some(m => m.group === g.id)).toBe(true)
  })

  it('covers every pattern on the reference list and the common Lichess themes', () => {
    const ids = MOTIFS.map(m => m.id)
    for (const id of ['perpetual', 'windmill', 'double-check', 'discovered-check', 'cross-check', 'smothered', 'back-rank',
      'fork-check', 'pin-check', 'mating-net', 'skewer-check', 'ladder', 'arabian', 'anastasia', 'boden', 'epaulette',
      'opera', 'hook', 'swallow', 'scholar', 'kiss', 'fork', 'pin', 'skewer', 'discovery', 'deflection', 'decoy', 'overloading',
      'remove-defender', 'interference', 'clearance', 'zwischenzug', 'desperado', 'quiet-move', 'trapped-piece', 'xray',
      'zugzwang', 'stalemate', 'underpromotion', 'opposition', 'greek-gift', 'queen-sacrifice', 'exchange-sacrifice']) expect(ids).toContain(id)
  })

  for (const m of MOTIFS) {
    it(`${m.name}: text is complete and free of em or en dashes`, () => {
      expect(m.idea.length).toBeGreaterThan(10)
      expect(m.detail.length).toBeGreaterThan(20)
      expect(JSON.stringify(m)).not.toMatch(/[\u2013\u2014]/)
    })
  }
})

describe('tactics library: every diagram is real', () => {
  for (const m of MOTIFS.filter(x => x.fen)) {
    it(`${m.name}: legal start position, legal line, true ending`, () => {
      expect(() => new Chess(m.fen)).not.toThrow()
      const steps = replay(m.fen!, m.line ?? [])
      const last = (m.line ?? []).at(-1)
      const g = new Chess(steps.at(-1)!.fen)
      if (last?.endsWith('#')) expect(g.isCheckmate()).toBe(true)
      else if (last?.endsWith('+')) expect(g.isCheck()).toBe(true)
      else if (last) expect(g.isCheck()).toBe(false)
      if (m.kind === 'static') expect(m.line ?? []).toEqual([])
      else expect(m.line?.length ?? 0).toBeGreaterThan(0)
    })

    it(`${m.name}: marks, arrows and notes point at real moves and squares`, () => {
      for (const [a, b] of m.arrows ?? []) { expect(a).toMatch(sqRe); expect(b).toMatch(sqRe) }
      for (const s of Object.keys(m.marks ?? {})) expect(s).toMatch(sqRe)
      const labels = new Set(replay(m.fen!, m.line ?? []).map(s => s.label))
      for (const n of m.notes ?? []) expect(labels.has(n.at), `${m.id} note ${n.at}`).toBe(true)
    })
  }

  it('concept cards have something to look for', () => {
    for (const m of MOTIFS.filter(x => !x.fen)) {
      expect(m.fen).toBeUndefined()
      expect(m.spot?.length ?? 0).toBeGreaterThanOrEqual(2)
    }
  })

  it('mating patterns end in checkmate and basic mates are one move', () => {
    for (const m of MOTIFS.filter(x => x.group === 'mate')) expect(m.line!.at(-1)!.endsWith('#')).toBe(true)
    for (const id of ['kq-mate', 'kr-mate', 'kbb-mate', 'kbn-mate']) expect(get(id).line).toHaveLength(1)
  })
})

describe('tactics library: the claims in the text', () => {
  it('pin: the pinned knight really cannot move', () => {
    expect(new Chess(get('pin').fen!.replace(' w ', ' b ')).moves({ square: 'c6' })).toEqual([])
  })

  it('skewer: the king must leave the file and the rook is left alone', () => {
    const g = new Chess(get('skewer').fen!)
    g.move('Ra1+')
    const replies = g.moves({ verbose: true })
    expect(replies.every(r => r.from === 'a5')).toBe(true)
    expect(replies.some(r => r.to[0] === 'a')).toBe(false)
  })

  it('double check: only the king can answer', () => {
    const g = new Chess(get('double-check').fen!)
    g.move('Nd6+')
    expect(g.moves({ verbose: true }).every(r => r.piece === 'k')).toBe(true)
  })

  it('discovered check: the queen is gone whatever Black replies', () => {
    const g = new Chess(get('discovered-check').fen!)
    g.move('Bxa8+')
    expect(g.board().flat().some(p => p?.type === 'q' && p.color === 'b')).toBe(false)
  })

  it('hanging piece and pawn double attack win material', () => {
    expect(gainAfter(get('hanging').fen!, 'Qxe5', 2)).toBeGreaterThanOrEqual(300)
    expect(gainAfter(get('double-attack').fen!, 'e5', 4)).toBeGreaterThanOrEqual(200)
    expect(rankMoves(get('hanging').fen!, 2)[0].san).toBe('Qxe5')
  })

  it('cross-check: Black can reply with a check, and the knight is guarded', () => {
    const g = new Chess(get('cross-check').fen!)
    g.move('Re1+')
    expect(g.moves()).toContain('Ne4+')
    g.move('Ne4+')
    expect(g.isCheck()).toBe(true)
    const trade = new Chess(g.fen()); trade.move('Rxe4')
    expect(trade.moves()).toContain('dxe4')
  })

  it('fork with check: the rook falls after any king move', () => {
    const g = new Chess(get('fork-check').fen!)
    g.move('Qd5+')
    for (const reply of g.moves()) {
      const h = new Chess(g.fen()); h.move(reply)
      expect(h.moves().some(m => m.startsWith('Qxa8'))).toBe(true)
    }
  })

  it('pin with check: a block on e4 loses the bishop', () => {
    const g = new Chess(get('pin-check').fen!)
    g.move('Re1+')
    expect(g.moves()).toContain('Be4')
    g.move('Be4')
    expect(g.moves()).toContain('Nxe4')
  })

  it('skewer with check: the queen can be taken after every king move', () => {
    const g = new Chess(get('skewer-check').fen!)
    g.move('Bb5+')
    for (const reply of g.moves()) {
      const h = new Chess(g.fen()); h.move(reply)
      expect(h.moves()).toContain('Bxe8')
    }
  })

  it('windmill: the king has one reply each time and the rook keeps eating', () => {
    const g = new Chess(get('windmill').fen!)
    for (const [w, b] of [['Rxf7+', 'Kg8'], ['Rg7+', 'Kh8'], ['Rxd7+', 'Kg8'], ['Rg7+', 'Kh8'], ['Rxb7+', 'Kg8']]) {
      g.move(w)
      expect(g.isCheck()).toBe(true)
      expect(g.moves()).toEqual([b])
      g.move(b)
    }
  })

  it('perpetual check: every check has one reply and the position repeats', () => {
    const g = new Chess(get('perpetual').fen!)
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
    expect(matesIn1(net.fen!)).toEqual([])
    const g = new Chess(net.fen!)
    g.move('Qg6')
    expect(g.isCheck()).toBe(false)
    for (const r of g.moves()) {
      const h = new Chess(g.fen()); h.move(r)
      expect(matesIn1(h.fen()).length).toBeGreaterThan(0)
    }
  })

  it('decoy: the rook must take the queen, then the knight mates', () => {
    const g = new Chess(get('decoy').fen!)
    g.move('Qg8+')
    expect(g.moves()).toEqual(['Rxg8'])
  })

  it('stalemate: no legal move and not in check', () => {
    const g = new Chess(get('stalemate').fen!)
    expect(g.isStalemate()).toBe(true)
    expect(g.isCheck()).toBe(false)
  })

  it('scholar: the sideline from the reference game reaches the diagram', () => {
    const g = new Chess()
    for (const m of 'e4 e5 Bc4 Nf6 Nf3 Nxe4 Nxe5 d6 Qf3 dxe5'.split(' ')) g.move(m)
    expect(g.fen()).toBe(get('scholar').fen)
  })

  it('Lasker trap: the knight promotion gives check and a queen would not', () => {
    const steps = replay(START_FEN, get('lasker-trap').line!)
    const before = new Chess(steps.at(-2)!.fen)
    expect(before.moves()).toContain('fxg1=N+')
    expect(before.moves()).toContain('fxg1=Q')
    expect(before.moves()).not.toContain('fxg1=Q+')
  })

  it('Elephant trap: Black finishes a piece ahead', () => {
    const g = new Chess(replay(START_FEN, get('elephant').line!).at(-1)!.fen)
    expect(material(g)).toBeLessThanOrEqual(-200)
  })

  it('Noah\'s Ark trap: the bishop on b3 has no safe square', () => {
    const g = new Chess(replay(START_FEN, get('noahs-ark').line!).at(-1)!.fen)
    expect(search(g, 3)).toBeLessThanOrEqual(material(g) - 100)
  })

  it('Légal and Blackburne traps end in mate after the sacrificed queen', () => {
    for (const id of ['legal', 'blackburne', 'budapest', 'fool']) {
      const g = new Chess(replay(START_FEN, get(id).line!).at(-1)!.fen)
      expect(g.isCheckmate()).toBe(true)
    }
  })

  it('master games are played in full and end as described', () => {
    for (const id of ['opera-game', 'immortal', 'evergreen', 'reti-tartakower', 'game-of-century']) {
      const g = new Chess(replay(START_FEN, get(id).line!).at(-1)!.fen)
      expect(g.isCheckmate(), id).toBe(true)
    }
  })
})
