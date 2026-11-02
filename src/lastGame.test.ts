import { describe, expect, it } from 'vitest'
import { forgetGame, LAST_GAME_MAX_AGE_MS, recallGame, rememberGame } from './lastGame'

const memory = () => {
  const m = new Map<string, string>()
  return { getItem: (k: string) => m.get(k) ?? null, setItem: (k: string, v: string) => void m.set(k, v), removeItem: (k: string) => void m.delete(k) }
}

describe('last game memory', () => {
  it('remembers the game and the colour you played', () => {
    const s = memory()
    rememberGame({ id: 'abc12345', color: 'b' }, 1000, s)
    expect(recallGame(2000, s)).toEqual({ id: 'abc12345', color: 'b', at: 1000 })
  })

  it('forgets a game that is finished', () => {
    const s = memory()
    rememberGame({ id: 'abc12345', color: 'w' }, 1000, s)
    forgetGame(s)
    expect(recallGame(2000, s)).toBeNull()
  })

  it('lets a stale note lapse so it cannot haunt the menu', () => {
    const s = memory()
    rememberGame({ id: 'abc12345', color: 'w' }, 1000, s)
    expect(recallGame(1000 + LAST_GAME_MAX_AGE_MS + 1, s)).toBeNull()
    expect(recallGame(1500, s)).toBeNull()      // and it was removed, not only hidden
  })

  it('ignores damaged or foreign data', () => {
    const s = memory()
    s.setItem('woodland-chess:last-game', '{not json')
    expect(recallGame(1, s)).toBeNull()
    s.setItem('woodland-chess:last-game', JSON.stringify({ id: 5, color: 'x', at: 'y' }))
    expect(recallGame(1, s)).toBeNull()
  })

  it('does not crash without storage', () => {
    expect(() => rememberGame({ id: 'a', color: 'w' }, 1, null)).not.toThrow()
    expect(recallGame(1, null)).toBeNull()
    expect(() => forgetGame(null)).not.toThrow()
  })
})
