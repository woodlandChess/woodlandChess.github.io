import { describe, expect, it } from 'vitest'
import { clockTone, formatClock, formatTimeControl, freeze, remainingMs, runningSide } from './clock'

describe('runningSide', () => {
  it('keeps both clocks stopped until each side has moved', () => {
    expect(runningSide(0, false)).toBeNull()
    expect(runningSide(1, false)).toBeNull()
  })
  it('runs the side to move afterwards', () => {
    expect(runningSide(2, false)).toBe('w')
    expect(runningSide(3, false)).toBe('b')
  })
  it('stops everything once the game is finished', () => {
    expect(runningSide(30, true)).toBeNull()
  })
})

describe('remainingMs / freeze', () => {
  const clock = { w: 60_000, b: 45_000, at: 1_000, running: 'w' as const }
  it('counts down only the running side', () => {
    expect(remainingMs(clock, 'w', 4_000)).toBe(57_000)
    expect(remainingMs(clock, 'b', 4_000)).toBe(45_000)
  })
  it('never goes negative and ignores clock skew', () => {
    expect(remainingMs(clock, 'w', 999_999)).toBe(0)
    expect(remainingMs(clock, 'w', 500)).toBe(60_000)
  })
  it('freeze captures the current values and stops', () => {
    expect(freeze(clock, 6_000)).toEqual({ w: 55_000, b: 45_000, at: 6_000, running: null })
  })
})

describe('formatClock', () => {
  it('formats minutes and seconds', () => {
    expect(formatClock(600_000)).toBe('10:00')
    expect(formatClock(65_000)).toBe('1:05')
    expect(formatClock(10_000)).toBe('0:10')
  })
  it('shows tenths under ten seconds', () => {
    expect(formatClock(9_950)).toBe('0:09.9')
    expect(formatClock(400)).toBe('0:00.4')
  })
  it('handles hours and empty clocks', () => {
    expect(formatClock(3_725_000)).toBe('1:02:05')
    expect(formatClock(0)).toBe('0:00')
    expect(formatClock(-5)).toBe('0:00')
  })
})

describe('clockTone', () => {
  it('escalates as time runs out', () => {
    expect(clockTone(120_000)).toBe('ok')
    expect(clockTone(29_000)).toBe('low')
    expect(clockTone(9_000)).toBe('critical')
    expect(clockTone(0)).toBe('out')
  })
})

describe('formatTimeControl', () => {
  it('matches the labels used in the menu', () => {
    expect(formatTimeControl(600_000, 0)).toBe('10+0')
    expect(formatTimeControl(900_000, 10_000)).toBe('15+10')
    expect(formatTimeControl(30_000, 0)).toBe('30s+0')
  })
})
