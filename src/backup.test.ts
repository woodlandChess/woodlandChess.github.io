import { describe, expect, it } from 'vitest'
import {
  applyBackup, BACKUP_AT_KEY, BACKUP_FORMAT, backupFileName, createBackup, lastBackupAt, markBackedUp, needsBackup, parseBackup,
} from './backup'
import { PROFILE_STORAGE_KEY, REVIEW_VERSION, type GameReview, type PlayerProfileData, type ProfileGame } from './profile/store'
import { PUZZLE_PROGRESS_KEY } from './puzzle/core/StorageService'

const memory = (initial: Record<string, string> = {}) => {
  const m = new Map(Object.entries(initial))
  return Object.assign(
    { getItem: (k: string) => m.get(k) ?? null, setItem: (k: string, v: string) => void m.set(k, v), removeItem: (k: string) => void m.delete(k) },
    { dump: () => Object.fromEntries(m) },
  )
}
const tally = { sum: 1, n: 1 }
const game = (id: string, playedAt: number): ProfileGame => ({ id, source: 'lichess', playedAt, white: 'a', black: 'b', userColor: 'w', result: 'win', moves: 'e2e4 e7e5' })
const review = (gameId: string): GameReview => ({
  gameId, version: REVIEW_VERSION, accuracy: 80, opponentAccuracy: 70, blunders: 0, mistakes: 0, inaccuracies: 0, brilliant: 0, great: 0,
  opening: 'Test', plies: [{ ply: 1, san: 'e4', uci: 'e2e4', color: 'w', grade: 'Best', loss: 0, winLoss: 0, phase: 'Opening', tags: [] }],
  wins: [50, 52],
  features: {
    moves: 1, captures: 0, checks: 0, trades: 0, pressure: 0, sacrifices: 0, castledPly: 0, worse: tally, better: tally,
    byPhase: { Opening: tally, Middlegame: tally, Endgame: tally }, squandered: false, firstMoves: ['e2e4'], firstPawn: 'e2e4',
    material: tally, gap: tally, critical: { n: 0, found: 0 }, tacticalErrors: 0, quietErrors: 0,
  },
})
const profile = (ids: string[], at = 5000): PlayerProfileData => ({ username: 'abyssal', games: ids.map((id, i) => game(id, 1000 + i)), reviews: ids.map(review), updatedAt: at })
const stored = (p: PlayerProfileData) => ({ [PROFILE_STORAGE_KEY]: JSON.stringify(p) })

describe('backup', () => {
  it('saves analysis, puzzle progress and settings, and nothing secret', () => {
    const s = memory({
      ...stored(profile(['g1'])), [PUZZLE_PROGRESS_KEY]: '{"totalSolved":9}', 'woodland-chess:online-prefs': '{"rated":true}', 'woodland-chess:sound': '1',
      'woodland-chess:lichess-token': '{"access_token":"SECRET"}', 'woodland-chess:pkce-verifier': 'SECRET2', 'woodland-chess:last-game': '{}',
    })
    const b = createBackup(s, 1234)
    expect(b.format).toBe(BACKUP_FORMAT)
    expect(Object.keys(b.entries).sort()).toEqual([PROFILE_STORAGE_KEY, PUZZLE_PROGRESS_KEY, 'woodland-chess:online-prefs', 'woodland-chess:sound'].sort())
    expect(JSON.stringify(b)).not.toContain('SECRET')
  })

  it('survives the full round trip: backup, wipe, restore', () => {
    const before = memory({ ...stored(profile(['g1', 'g2', 'g3'])), [PUZZLE_PROGRESS_KEY]: '{"totalSolved":9}' })
    const text = JSON.stringify(createBackup(before, 99))
    const fresh = memory()                                           // the re-added app: empty storage
    const parsed = parseBackup(text)
    expect(parsed.ok).toBe(true)
    if (!parsed.ok) return
    expect(parsed.summary).toMatchObject({ games: 3, reviews: 3, puzzles: true })
    const r = applyBackup(parsed.backup, fresh)
    expect(r.addedGames).toBe(3)
    expect(r.addedReviews).toBe(3)
    expect(r.puzzlesRestored).toBe(true)
    expect(JSON.parse(fresh.getItem(PROFILE_STORAGE_KEY)!).reviews).toHaveLength(3)
    expect(fresh.getItem(PUZZLE_PROGRESS_KEY)).toBe('{"totalSolved":9}')
  })

  it('merges instead of overwriting, so new work on this device is never lost', () => {
    const backup = createBackup(memory(stored(profile(['old1', 'old2']))), 1)
    const here = memory({ ...stored(profile(['old2', 'new1'], 9000)), [PUZZLE_PROGRESS_KEY]: '{"totalSolved":50}' })
    const r = applyBackup(backup, here)
    expect(r.profile.games.map(g => g.id).sort()).toEqual(['new1', 'old1', 'old2'])
    expect(r.profile.reviews.map(x => x.gameId).sort()).toEqual(['new1', 'old1', 'old2'])
    expect(r.addedGames).toBe(1)
    expect(here.getItem(PUZZLE_PROGRESS_KEY)).toBe('{"totalSolved":50}')      // newer progress is kept
    expect(r.puzzlesRestored).toBe(false)
  })

  it('keeps at most 100 games, newest first', () => {
    const ids = Array.from({ length: 120 }, (_, i) => `g${i}`)
    const r = applyBackup(createBackup(memory(stored(profile(ids))), 1), memory())
    expect(r.profile.games).toHaveLength(100)
    expect(r.profile.games[0].playedAt).toBeGreaterThanOrEqual(r.profile.games[99].playedAt)
  })

  it('refuses files that are not backups, and damaged ones', () => {
    for (const bad of ['not json', '{}', '[]', JSON.stringify({ format: 'something-else', entries: {} }),
      JSON.stringify({ format: BACKUP_FORMAT, version: 1, entries: {} }),
      JSON.stringify({ format: BACKUP_FORMAT, version: 1, entries: { [PROFILE_STORAGE_KEY]: 'not json {' } }),
      JSON.stringify({ format: BACKUP_FORMAT, version: 1, entries: { [PROFILE_STORAGE_KEY]: 5 } })]) {
      expect(parseBackup(bad).ok, bad).toBe(false)
    }
  })

  it('refuses a backup from a newer version of the app', () => {
    const r = parseBackup(JSON.stringify({ format: BACKUP_FORMAT, version: 99, createdAt: 1, entries: { [PROFILE_STORAGE_KEY]: '{}' } }))
    expect(r.ok).toBe(false)
  })

  it('ignores keys that are not on the allow-list, such as a planted login token', () => {
    const r = parseBackup(JSON.stringify({ format: BACKUP_FORMAT, version: 1, createdAt: 1, entries: { [PROFILE_STORAGE_KEY]: JSON.stringify(profile(['g1'])), 'woodland-chess:lichess-token': '{"access_token":"evil"}' } }))
    expect(r.ok).toBe(true)
    if (!r.ok) return
    const s = memory()
    applyBackup(r.backup, s)
    expect(s.getItem('woodland-chess:lichess-token')).toBeNull()
  })

  it('drops reviews that are not valid instead of showing them', () => {
    const p = profile(['g1']); (p.reviews[0] as any).accuracy = 'oops'
    const r = applyBackup(createBackup(memory(stored(p)), 1), memory())
    expect(r.profile.games).toHaveLength(1)
    expect(r.profile.reviews).toHaveLength(0)
  })

  it('tracks the last backup and nudges only when there is unsaved analysis', () => {
    const s = memory()
    expect(lastBackupAt(s)).toBe(0)
    markBackedUp(7000, s)
    expect(s.dump()[BACKUP_AT_KEY]).toBe('7000')
    expect(lastBackupAt(s)).toBe(7000)
    const p = profile(['g1'], 9000)
    expect(needsBackup(p, 7000)).toBe(true)
    expect(needsBackup(p, 9500)).toBe(false)
    expect(needsBackup({ reviews: [], updatedAt: 9000 }, 0)).toBe(false)
  })

  it('names the file with the date', () => {
    expect(backupFileName(Date.UTC(2026, 10, 5))).toBe('woodland-chess-backup-2026-11-05.json')
  })
})
