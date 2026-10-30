/**
 * Mode <-> URL mapping, kept free of React so it can be unit-tested.
 *
 * Every top-level screen has a real path (`/ai`, `/learn`, ...). The deploy
 * workflow publishes an index.html for each of them, so reloading or sharing a
 * link never lands on the GitHub Pages 404 fallback.
 */
export type ModeId = 'home' | 'ai' | 'online' | 'puzzle' | 'profile' | 'learn'

/** Route segment for each mode ('' is the root, the Home page). */
export const MODE_SEGMENTS: Record<ModeId, string> = {
  home: '',
  ai: 'ai',
  online: 'multiplayer',
  puzzle: 'puzzle',
  profile: 'profile',
  learn: 'learn',
}

/** Segments that need a real folder with its own index.html on GitHub Pages. */
export const ROUTE_SEGMENTS = Object.values(MODE_SEGMENTS).filter(Boolean)

const baseOf = (base: string) => base.replace(/\/+$/, '')

/** Strip the deploy base and trailing slashes: '/repo/ai/' -> 'ai'. */
function segmentOf(pathname: string, base: string): string {
  const b = baseOf(base)
  const rest = b && pathname.startsWith(b) ? pathname.slice(b.length) : pathname
  return rest.replace(/^\/+|\/+$/g, '').toLowerCase()
}

export function modeFromPath(pathname: string, base = '/'): ModeId {
  const segment = segmentOf(pathname, base)
  if (segment === 'home') return 'home'
  const hit = (Object.keys(MODE_SEGMENTS) as ModeId[]).find(id => MODE_SEGMENTS[id] === segment)
  return hit ?? 'home'
}

export function pathForMode(mode: ModeId, base = '/'): string {
  return `${baseOf(base)}/${MODE_SEGMENTS[mode]}`
}

/** Document title for a mode (helps history entries and screen readers). */
export const MODE_TITLES: Record<ModeId, string> = {
  home: 'Woodland Chess',
  ai: 'Play the computer · Woodland Chess',
  online: 'Play online · Woodland Chess',
  puzzle: 'Puzzles · Woodland Chess',
  profile: 'Analyze · Woodland Chess',
  learn: 'Learn · Woodland Chess',
}
