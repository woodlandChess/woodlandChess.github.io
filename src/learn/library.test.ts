import { describe, expect, it } from 'vitest'
import { Chess } from 'chess.js'
import { LORE, readingMinutes, type Article } from './lore'
import { STRATEGY } from './strategy'

const sqRe = /^[a-h][1-8]$/
const all: [string, Article[]][] = [['lore', LORE], ['strategy', STRATEGY]]

describe.each(all)('%s articles', (_name, articles) => {
  it('have unique ids, topics, titles and summaries', () => {
    expect(new Set(articles.map(a => a.id)).size).toBe(articles.length)
    for (const a of articles) {
      expect(a.topic.length).toBeGreaterThan(2)
      expect(a.title.length).toBeGreaterThan(5)
      expect(a.summary.length).toBeGreaterThan(20)
      expect(a.blocks.length).toBeGreaterThan(1)
      expect(readingMinutes(a)).toBeGreaterThanOrEqual(1)
    }
  })

  it('contain no em or en dashes anywhere', () => {
    expect(JSON.stringify(articles)).not.toMatch(/[\u2013\u2014]/)
  })

  it('have well-formed blocks, tables and diagrams', () => {
    for (const a of articles) for (const b of a.blocks) {
      if (b.t === 'table') for (const r of b.rows) expect(r.length, `${a.id} table row`).toBe(b.head.length)
      if (b.t === 'ul') expect(b.items.length).toBeGreaterThan(0)
      if (b.t === 'board') {
        expect(() => new Chess(b.fen), `${a.id} diagram`).not.toThrow()
        for (const s of Object.keys(b.marks ?? {})) expect(s).toMatch(sqRe)
        for (const [x, y] of b.arrows ?? []) { expect(x).toMatch(sqRe); expect(y).toMatch(sqRe) }
      }
    }
  })
})

describe('coverage', () => {
  it('strategy covers the main areas', () => {
    const topics = new Set(STRATEGY.map(a => a.topic))
    for (const t of ['Foundations', 'Pawns', 'Pieces', 'Attack and defence', 'Planning', 'Endgames', 'Masters', 'Training']) expect(topics.has(t), t).toBe(true)
    expect(STRATEGY.length).toBeGreaterThanOrEqual(30)
  })

  it('lore includes history, ratings, players, schools and engines', () => {
    const ids = LORE.map(a => a.id)
    for (const id of ['words', 'elo', 'players', 'schools', 'styles', 'engines', 'panel']) expect(ids).toContain(id)
  })
})
