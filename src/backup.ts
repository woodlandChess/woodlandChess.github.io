/**
 * Backup and restore of everything worth keeping: your analysed games, puzzle progress and settings.
 *
 * Why this exists: a web app's storage belongs to the installed app itself. When a phone deletes the
 * home-screen app, it deletes that storage with it, and nothing the page does can prevent that. The only
 * way to survive it is to keep a copy somewhere the app does not own, so the backup is a plain file that
 * goes to Files, iCloud Drive or anywhere else the person chooses.
 *
 * Only an allow-list of keys is saved. Login tokens, sign-in secrets and download caches are never included.
 */
import { mergeProfiles, parseProfile, PROFILE_STORAGE_KEY, type PlayerProfileData } from './profile/store'
import { PUZZLE_PROGRESS_KEY } from './puzzle/core/StorageService'

export const BACKUP_FORMAT = 'woodland-chess-backup'
export const BACKUP_VERSION = 1
export const BACKUP_AT_KEY = 'woodland-chess:backup-at'
/** Files bigger than this are not backups of ours (a full backup is a few megabytes at most). */
export const MAX_BACKUP_BYTES = 20 * 1024 * 1024

const SOUND_KEY = 'woodland-chess:sound'
const ONLINE_PREFS_KEY = 'woodland-chess:online-prefs'
export const BACKUP_KEYS = [PROFILE_STORAGE_KEY, PUZZLE_PROGRESS_KEY, ONLINE_PREFS_KEY, SOUND_KEY] as const

export type Store = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>
const defaultStore = (): Store | null => { try { return localStorage } catch { return null } }

export interface Backup {
  format: typeof BACKUP_FORMAT
  version: number
  createdAt: number
  entries: Record<string, string>
}

export interface BackupSummary { games: number; reviews: number; puzzles: boolean; createdAt: number }

/** Collects the allow-listed entries that exist on this device. */
export function createBackup(s: Store | null = defaultStore(), now = Date.now()): Backup {
  const entries: Record<string, string> = {}
  for (const key of BACKUP_KEYS) {
    try { const v = s?.getItem(key); if (typeof v === 'string' && v) entries[key] = v } catch { /* unreadable: skip */ }
  }
  return { format: BACKUP_FORMAT, version: BACKUP_VERSION, createdAt: now, entries }
}

export function summarize(b: Backup): BackupSummary {
  let games = 0, reviews = 0
  try {
    const p = parseProfile(JSON.parse(b.entries[PROFILE_STORAGE_KEY] ?? 'null'))
    games = p.games.length; reviews = p.reviews.length
  } catch { /* no profile in this backup */ }
  return { games, reviews, puzzles: PUZZLE_PROGRESS_KEY in b.entries, createdAt: b.createdAt }
}

/** Reads the text of a chosen file. Never trusts it: anything that is not one of our backups is refused. */
export function parseBackup(text: string): { ok: true; backup: Backup; summary: BackupSummary } | { ok: false; reason: string } {
  if (text.length > MAX_BACKUP_BYTES) return { ok: false, reason: 'That file is too large to be a Woodland Chess backup.' }
  let raw: any
  try { raw = JSON.parse(text) } catch { return { ok: false, reason: 'That file is not a Woodland Chess backup.' } }
  if (!raw || raw.format !== BACKUP_FORMAT || typeof raw.entries !== 'object' || raw.entries === null) {
    return { ok: false, reason: 'That file is not a Woodland Chess backup.' }
  }
  if (typeof raw.version !== 'number' || raw.version > BACKUP_VERSION) {
    return { ok: false, reason: 'This backup was made by a newer version of the app. Update the app and try again.' }
  }
  const entries: Record<string, string> = {}
  for (const key of BACKUP_KEYS) {
    const v = raw.entries[key]
    if (v === undefined) continue
    if (typeof v !== 'string') return { ok: false, reason: 'The backup is damaged.' }
    try { JSON.parse(v) } catch { if (key !== SOUND_KEY) return { ok: false, reason: 'The backup is damaged.' } }
    entries[key] = v
  }
  if (!Object.keys(entries).length) return { ok: false, reason: 'The backup is empty.' }
  const backup: Backup = { format: BACKUP_FORMAT, version: raw.version, createdAt: Number(raw.createdAt) || 0, entries }
  return { ok: true, backup, summary: summarize(backup) }
}

export interface Restored { profile: PlayerProfileData; addedGames: number; addedReviews: number; puzzlesRestored: boolean }

/**
 * Puts a backup back. Analysis is merged with whatever is already here, so restoring never throws away new work.
 * Settings and puzzle progress are only filled in when this device has none yet, so an older backup cannot
 * overwrite newer progress.
 */
export function applyBackup(b: Backup, s: Store | null = defaultStore()): Restored {
  const local = (() => { try { return parseProfile(JSON.parse(s?.getItem(PROFILE_STORAGE_KEY) ?? 'null')) } catch { return parseProfile(null) } })()
  const incoming = parseProfile((() => { try { return JSON.parse(b.entries[PROFILE_STORAGE_KEY] ?? 'null') } catch { return null } })())
  const merged = mergeProfiles(local, incoming)
  try { s?.setItem(PROFILE_STORAGE_KEY, JSON.stringify(merged)) } catch { /* storage full or unavailable */ }

  let puzzlesRestored = false
  for (const key of [PUZZLE_PROGRESS_KEY, ONLINE_PREFS_KEY, SOUND_KEY]) {
    const value = b.entries[key]
    if (value === undefined) continue
    try {
      if (s?.getItem(key)) continue
      s?.setItem(key, value)
      if (key === PUZZLE_PROGRESS_KEY) puzzlesRestored = true
    } catch { /* storage unavailable */ }
  }
  const localIds = new Set(local.reviews.map(r => r.gameId)), localGames = new Set(local.games.map(g => g.id))
  return {
    profile: merged,
    addedGames: merged.games.filter(g => !localGames.has(g.id)).length,
    addedReviews: merged.reviews.filter(r => !localIds.has(r.gameId)).length,
    puzzlesRestored,
  }
}

// ── when the last backup was made ────────────────────────────────────────────────────────────────
export function lastBackupAt(s: Store | null = defaultStore()): number {
  try { return Number(s?.getItem(BACKUP_AT_KEY)) || 0 } catch { return 0 }
}
export function markBackedUp(now = Date.now(), s: Store | null = defaultStore()) {
  try { s?.setItem(BACKUP_AT_KEY, String(now)) } catch { /* ignore */ }
}

/** True when there is analysis that has never been saved to a file, or changed since the last save. */
export function needsBackup(profile: Pick<PlayerProfileData, 'reviews' | 'updatedAt'>, backedUpAt: number): boolean {
  return profile.reviews.length > 0 && profile.updatedAt > backedUpAt
}

export function backupFileName(now = Date.now()): string {
  return `woodland-chess-backup-${new Date(now).toISOString().slice(0, 10)}.json`
}

// ── files (browser only) ───────────────────────────────────────────────────────────────────────
/**
 * Hands the backup to the person: the share sheet where it supports files (on iPhone this offers Save to Files,
 * iCloud Drive, AirDrop and more), otherwise a normal download.
 */
export async function saveBackupFile(b: Backup): Promise<'shared' | 'downloaded' | 'cancelled'> {
  const name = backupFileName(b.createdAt)
  const blob = new Blob([JSON.stringify(b)], { type: 'application/json' })
  const file = new File([blob], name, { type: 'application/json' })
  const nav = navigator as Navigator & { canShare?: (d: ShareData) => boolean }
  if (typeof nav.share === 'function' && nav.canShare?.({ files: [file] })) {
    try { await nav.share({ files: [file], title: 'Woodland Chess backup' }); return 'shared' }
    catch (e) { if (e instanceof DOMException && e.name === 'AbortError') return 'cancelled' /* otherwise fall back to a download */ }
  }
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = name
  document.body.appendChild(a); a.click(); a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 10_000)
  return 'downloaded'
}
