// ── Game clock helpers (pure, unit-tested) ───────────────────────────────────
//
// Lichess streams the remaining time for both sides (`wtime` / `btime`, in
// milliseconds) with every game state. We keep one snapshot - the values as
// of the moment the event arrived - and derive what to display from it, so
// the clock ticks smoothly between server events without any polling.
//
// Lichess only starts the clocks once both players have moved (plies >= 2).

import type { Color } from 'chess.js'

export interface ClockState {
  /** Remaining ms for White / Black as of `at`. */
  w: number
  b: number
  /** `performance.now()` when the snapshot was taken. */
  at: number
  /** Side whose clock is counting down right now, or null when stopped. */
  running: Color | null
}

export type ClockTone = 'ok' | 'low' | 'critical' | 'out'

/** Which side's clock should be running after `plies` half-moves. */
export function runningSide(plies: number, finished: boolean): Color | null {
  if (finished || plies < 2) return null
  return plies % 2 === 0 ? 'w' : 'b'
}

/** Remaining ms for `color` at time `now`. Never negative. */
export function remainingMs(clock: ClockState, color: Color, now: number): number {
  const base = color === 'w' ? clock.w : clock.b
  const elapsed = clock.running === color ? Math.max(0, now - clock.at) : 0
  return Math.max(0, base - elapsed)
}

/** Freezes the clock at `now` (used when the game ends or after our own move). */
export function freeze(clock: ClockState, now: number): ClockState {
  return {
    w: remainingMs(clock, 'w', now),
    b: remainingMs(clock, 'b', now),
    at: now,
    running: null,
  }
}

/** m:ss, h:mm:ss over an hour, and tenths of a second under ten seconds. */
export function formatClock(ms: number): string {
  if (!Number.isFinite(ms) || ms <= 0) return '0:00'
  if (ms < 10_000) {
    const tenths = Math.floor(ms / 100)
    return `0:${String(Math.floor(tenths / 10)).padStart(2, '0')}.${tenths % 10}`
  }
  const total = Math.ceil(ms / 1000)
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  return h > 0
    ? `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
    : `${m}:${String(s).padStart(2, '0')}`
}

/** Visual urgency: amber under 30s, red under 10s. */
export function clockTone(ms: number): ClockTone {
  if (ms <= 0) return 'out'
  if (ms < 10_000) return 'critical'
  if (ms < 30_000) return 'low'
  return 'ok'
}

/** "10+0", "3+2", "30s+0" - from Lichess's initial (ms) / increment (ms). */
export function formatTimeControl(initialMs: number, incrementMs: number): string {
  const inc = Math.round(incrementMs / 1000)
  const base = initialMs % 60_000 === 0 ? String(initialMs / 60_000) : `${Math.round(initialMs / 1000)}s`
  return `${base}+${inc}`
}
