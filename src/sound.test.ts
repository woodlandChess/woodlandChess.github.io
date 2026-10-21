import { describe, expect, it } from 'vitest'
import { soundForMove, soundForOutcome, scheduleSlot, PIECE_GAP, PIECE_MAX_DELAY } from './sound'

describe('soundForMove', () => {
  it('quiet move for a plain move', () => expect(soundForMove({ san: 'e4', flags: 'b' })).toBe('move'))
  it('capture for captures and en passant', () => {
    expect(soundForMove({ san: 'Nxe5', flags: 'c' })).toBe('capture')
    expect(soundForMove({ san: 'exd6', flags: 'e' })).toBe('capture')
  })
  it('castle for either side', () => {
    expect(soundForMove({ san: 'O-O', flags: 'k' })).toBe('castle')
    expect(soundForMove({ san: 'O-O-O', flags: 'q' })).toBe('castle')
  })
  it('check / mate share the bell, and outrank a capture', () => {
    expect(soundForMove({ san: 'Qh5+', flags: 'n' })).toBe('check')
    expect(soundForMove({ san: 'Qxf7#', flags: 'c' })).toBe('check')
  })
  it('promotion outranks a plain check', () => {
    expect(soundForMove({ san: 'e8=Q', flags: 'p', promotion: 'q' })).toBe('promote')
  })
})

describe('soundForOutcome', () => {
  it('chimes for results, stays silent for aborted games', () => {
    expect(soundForOutcome('win')).toBe('win')
    expect(soundForOutcome('loss')).toBe('loss')
    expect(soundForOutcome('draw')).toBe('draw')
    expect(soundForOutcome('aborted')).toBeNull()
  })
})

describe('scheduleSlot (no doubled piece sounds)', () => {
  it('plays immediately when nothing played recently', () => {
    expect(scheduleSlot(10, -Infinity, 'move', null, -Infinity)).toBe(10)
  })
  it('drops an identical sound fired twice for the same event', () => {
    expect(scheduleSlot(10.01, 10, 'move', 'move', 10)).toBeNull()
  })
  it('spaces two quick moves apart instead of stacking them', () => {
    expect(scheduleSlot(10.05, 10, 'capture', 'move', 10)).toBeCloseTo(10 + PIECE_GAP)
  })
  it('drops a piece sound that would be stale', () => {
    expect(scheduleSlot(10, 10 + PIECE_MAX_DELAY + 0.5, 'move', 'capture', 5)).toBeNull()
  })
  it('never delays non-piece sounds', () => {
    expect(scheduleSlot(10.01, 10, 'notify', 'move', 10)).toBe(10.01)
  })
})
