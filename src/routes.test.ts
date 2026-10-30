import { describe, expect, it } from 'vitest'
import { modeFromPath, pathForMode, ROUTE_SEGMENTS, type ModeId } from './routes'

describe('routes', () => {
  it('maps every mode to a path and back', () => {
    const modes: ModeId[] = ['home', 'ai', 'online', 'puzzle', 'profile', 'learn']
    for (const m of modes) expect(modeFromPath(pathForMode(m))).toBe(m)
  })

  it('treats the root, /home and unknown paths as Home', () => {
    expect(modeFromPath('/')).toBe('home')
    expect(modeFromPath('/home')).toBe('home')
    expect(modeFromPath('/nope/at/all')).toBe('home')
  })

  it('ignores trailing slashes and case', () => {
    expect(modeFromPath('/learn/')).toBe('learn')
    expect(modeFromPath('/Multiplayer')).toBe('online')
  })

  it('honours a deploy base path', () => {
    expect(modeFromPath('/chess/ai', '/chess/')).toBe('ai')
    expect(modeFromPath('/chess/', '/chess/')).toBe('home')
    expect(pathForMode('learn', '/chess/')).toBe('/chess/learn')
    expect(pathForMode('home', '/chess/')).toBe('/chess/')
  })

  it('lists the folders the deploy step must create', () => {
    expect(ROUTE_SEGMENTS.sort()).toEqual(['ai', 'learn', 'multiplayer', 'profile', 'puzzle'])
  })
})
