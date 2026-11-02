/**
 * Remembers the game in progress, so coming back to the Multiplayer tab (or reopening the app after the phone
 * evicted it) puts you straight back on the board instead of waiting for the network to say where you were.
 * The record is only a hint: the game stream is the source of truth, and a finished game clears it.
 */
const KEY = 'woodland-chess:last-game'
/** Longer than any realistic game, short enough that a forgotten record cannot haunt the menu. */
export const LAST_GAME_MAX_AGE_MS = 3 * 60 * 60 * 1000

export interface LastGame { id: string; color: 'w' | 'b'; at: number }

type Store = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>
const store = (): Store | null => { try { return localStorage } catch { return null } }

export function rememberGame(game: { id: string; color: 'w' | 'b' }, now = Date.now(), s: Store | null = store()) {
  try { s?.setItem(KEY, JSON.stringify({ id: game.id, color: game.color, at: now } satisfies LastGame)) } catch { /* storage unavailable */ }
}

export function recallGame(now = Date.now(), s: Store | null = store()): LastGame | null {
  try {
    const raw = JSON.parse(s?.getItem(KEY) ?? 'null') as Partial<LastGame> | null
    if (!raw || typeof raw.id !== 'string' || (raw.color !== 'w' && raw.color !== 'b') || typeof raw.at !== 'number') return null
    if (now - raw.at > LAST_GAME_MAX_AGE_MS || raw.at > now + 60_000) { s?.removeItem(KEY); return null }
    return { id: raw.id, color: raw.color, at: raw.at }
  } catch { return null }
}

export function forgetGame(s: Store | null = store()) {
  try { s?.removeItem(KEY) } catch { /* ignore */ }
}
