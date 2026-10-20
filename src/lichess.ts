// ── Lichess OAuth (PKCE, public client) + Board API client ───────────────────
//
// Lichess supports unregistered public OAuth2 clients using the Authorization
// Code flow with PKCE: no client secret, no manual app registration. A
// code_verifier + S256 challenge are generated locally, the user is sent to
// lichess.org to authorize, and the returned code is exchanged for a token
// entirely in the browser. This works on a static site (GitHub Pages) with
// no backend server. See https://lichess.org/api#tag/OAuth
//
// Scope used:
//   board:play - play games via the Board API (seek, move, resign, abort)
//
// Docs: https://lichess.org/api#tag/Board

const CLIENT_ID = 'woodland-chess'
const AUTH_URL  = 'https://lichess.org/oauth'
const TOKEN_URL = 'https://lichess.org/api/token'
const API_BASE  = 'https://lichess.org'
const SCOPES    = ['board:play']

const LS_TOKEN_KEY     = 'woodland-chess:lichess-token'
const SS_VERIFIER_KEY  = 'woodland-chess:pkce-verifier'
const SS_STATE_KEY     = 'woodland-chess:pkce-state'

export interface LichessToken {
  access_token: string
  token_type: string
  expires_at: number   // ms epoch, computed locally from expires_in
}

function redirectUri(): string {
  // Works both in local dev (http://localhost:5173/) and on the deployed
  // site, whatever base path Vite was built with.
  return window.location.origin + import.meta.env.BASE_URL
}

// ── PKCE helpers ─────────────────────────────────────────────────────────────
function randomString(len = 64): string {
  const bytes = new Uint8Array(len)
  crypto.getRandomValues(bytes)
  return Array.from(bytes, b => b.toString(36).padStart(2, '0')).join('').slice(0, len)
}

function base64UrlEncode(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let str = ''
  for (const b of bytes) str += String.fromCharCode(b)
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

async function sha256Challenge(verifier: string): Promise<string> {
  const data   = new TextEncoder().encode(verifier)
  const digest = await crypto.subtle.digest('SHA-256', data)
  return base64UrlEncode(digest)
}

// ── Token storage ─────────────────────────────────────────────────────────────
export function getStoredToken(): LichessToken | null {
  const raw = localStorage.getItem(LS_TOKEN_KEY)
  if (!raw) return null
  try {
    const token: LichessToken = JSON.parse(raw)
    if (!token.access_token || token.expires_at < Date.now()) {
      localStorage.removeItem(LS_TOKEN_KEY)
      return null
    }
    return token
  } catch {
    return null
  }
}

export function clearToken() {
  localStorage.removeItem(LS_TOKEN_KEY)
}

function storeToken(access_token: string, expires_in: number): LichessToken {
  const token: LichessToken = {
    access_token,
    token_type: 'Bearer',
    // Shave 60s off the expiry so we never use a token right as it dies
    expires_at: Date.now() + Math.max(expires_in - 60, 60) * 1000,
  }
  localStorage.setItem(LS_TOKEN_KEY, JSON.stringify(token))
  return token
}

// ── Login flow ───────────────────────────────────────────────────────────────
/** Redirects the browser to Lichess to authorize this app. */
export async function startLogin() {
  sessionStorage.setItem('woodland-chess:oauth-return-path', window.location.pathname)
  const verifier  = randomString(64)
  const challenge = await sha256Challenge(verifier)
  const state     = randomString(24)
  sessionStorage.setItem(SS_VERIFIER_KEY, verifier)
  sessionStorage.setItem(SS_STATE_KEY, state)

  const url = new URL(AUTH_URL)
  url.searchParams.set('response_type', 'code')
  url.searchParams.set('client_id', CLIENT_ID)
  url.searchParams.set('redirect_uri', redirectUri())
  url.searchParams.set('scope', SCOPES.join(' '))
  url.searchParams.set('state', state)
  url.searchParams.set('code_challenge', challenge)
  url.searchParams.set('code_challenge_method', 'S256')
  window.location.href = url.toString()
}

/**
 * Call once on app load. If the URL contains a Lichess OAuth redirect
 * (`?code=...&state=...`), exchanges the code for a token, stores it, and
 * strips the query string from the URL. Returns the token if one was
 * obtained this way, otherwise null (including: nothing to do here).
 */
export async function handleAuthRedirect(): Promise<LichessToken | null> {
  const params = new URLSearchParams(window.location.search)
  const code  = params.get('code')
  const state = params.get('state')
  if (!code || !state) return null

  const expectedState = sessionStorage.getItem(SS_STATE_KEY)
  const verifier       = sessionStorage.getItem(SS_VERIFIER_KEY)
  sessionStorage.removeItem(SS_STATE_KEY)
  sessionStorage.removeItem(SS_VERIFIER_KEY)
  const returnPath = sessionStorage.getItem('woodland-chess:oauth-return-path')
  sessionStorage.removeItem('woodland-chess:oauth-return-path')

  // Always clean the URL, even on failure, so a refresh doesn't re-trigger this.
  window.history.replaceState({}, '', window.location.origin + (returnPath || window.location.pathname))
  window.dispatchEvent(new PopStateEvent('popstate'))

  if (!verifier || state !== expectedState) return null

  try {
    const res = await fetch(TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        grant_type:    'authorization_code',
        code,
        code_verifier: verifier,
        redirect_uri:  redirectUri(),
        client_id:     CLIENT_ID,
      }),
    })
    if (!res.ok) return null
    const data = await res.json()
    if (!data.access_token) return null
    return storeToken(data.access_token, data.expires_in ?? 3600)
  } catch {
    return null
  }
}

export function logout() {
  clearToken()
}

// ── Board API client ────────────────────────────────────────────────────────
export interface LichessPerf {
  rating: number
  /** Rated games played in this speed. */
  games?: number
  /** Rating change over the last dozen games. */
  prog?: number
  /** True while the rating is still provisional (few games played). */
  prov?: boolean
}

export interface SideRating { rating?: number; diff?: number }

export interface LichessProfile {
  id: string
  username: string
  title?: string
  perfs?: Record<string, LichessPerf>
}

export type Perf = 'bullet' | 'blitz' | 'rapid' | 'classical'

export type TimeControl = { id: string; label: string; time: number; increment: number; perf: Perf }

export const PERF_ORDER: Perf[] = ['bullet', 'blitz', 'rapid', 'classical']

/** Menu copy for each speed. Ranges follow Lichess's own definitions. */
export const PERF_META: Record<Perf, { label: string; blurb: string }> = {
  bullet:    { label: 'Bullet',    blurb: 'Lightning games under 3 minutes' },
  blitz:     { label: 'Blitz',     blurb: 'Fast games, 3 to 8 minutes' },
  rapid:     { label: 'Rapid',     blurb: 'Time to think, 8 to 25 minutes' },
  classical: { label: 'Classical', blurb: 'Long, deep games over 25 minutes' },
}

const tc = (time: number, increment: number, perf: Perf): TimeControl =>
  ({ id: `${time}+${increment}`, label: `${time}+${increment} · ${PERF_META[perf].label}`, time, increment, perf })

export const TIME_CONTROLS: TimeControl[] = [
  tc(1, 0, 'bullet'), tc(2, 1, 'bullet'),
  tc(3, 0, 'blitz'),  tc(3, 2, 'blitz'), tc(5, 0, 'blitz'), tc(5, 3, 'blitz'),
  tc(10, 0, 'rapid'), tc(15, 10, 'rapid'),
  tc(30, 0, 'classical'),
]

export function timeControlsFor(perf: Perf): TimeControl[] {
  return TIME_CONTROLS.filter(t => t.perf === perf)
}

/** Parses a fetch Response body as a newline-delimited JSON stream. */
async function* readNDJSON(res: Response, signal?: AbortSignal): AsyncGenerator<any> {
  if (!res.body) return
  const reader  = res.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  try {
    while (true) {
      if (signal?.aborted) { await reader.cancel(); return }
      const { value, done } = await reader.read()
      if (done) return
      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() ?? ''
      for (const line of lines) {
        const trimmed = line.trim()
        if (!trimmed) continue
        try { yield JSON.parse(trimmed) } catch { /* ignore malformed line */ }
      }
    }
  } catch {
    /* stream aborted/closed - normal on cleanup */
  }
}

export class LichessClient {
  constructor(private token: string) {}

  private headers(extra: Record<string, string> = {}) {
    return { Authorization: `Bearer ${this.token}`, ...extra }
  }

  async getProfile(): Promise<LichessProfile> {
    const res = await fetch(`${API_BASE}/api/account`, { headers: this.headers() })
    if (!res.ok) throw new Error('Failed to load Lichess profile')
    return res.json()
  }

  /** Streams account-wide events: gameStart, gameFinish, challenge, etc. */
  streamEvents(signal?: AbortSignal) {
    return (async function* (this: LichessClient) {
      const res = await fetch(`${API_BASE}/api/stream/event`, { headers: this.headers(), signal })
      if (!res.ok) throw new Error('Failed to open event stream')
      yield* readNDJSON(res, signal)
    }).call(this)
  }

  /**
   * Creates a real-time seek (an open challenge against any opponent at the
   * given time control). The HTTP request stays open until Lichess matches
   * it or it's cancelled - we don't read its body; a `gameStart` event
   * arrives on the account event stream once matched. Abort `signal` to
   * cancel the search.
   */
  async seek(tc: TimeControl, signal?: AbortSignal, rated = true): Promise<void> {
    const body = new URLSearchParams({
      rated: String(rated),
      time: String(tc.time),
      increment: String(tc.increment),
      variant: 'standard',
    })
    const res = await fetch(`${API_BASE}/api/board/seek`, {
      method: 'POST',
      headers: this.headers({ 'Content-Type': 'application/x-www-form-urlencoded' }),
      body,
      signal,
    })
    // A rejected seek (bad token scope, already seeking, rate limit...) used to
    // leave the UI "searching" forever. Surface it instead.
    if (!res.ok) {
      let detail = ''
      try { detail = (await res.json())?.error ?? '' } catch { /* body wasn't JSON */ }
      throw new Error(detail || `Lichess refused the search (${res.status}).`)
    }
    // Success keeps the connection open until matched; drain it so the request
    // finishes cleanly when Lichess closes it.
    try { await res.text() } catch { /* aborted - normal */ }
  }

  streamGame(gameId: string, signal?: AbortSignal) {
    return (async function* (this: LichessClient) {
      const res = await fetch(`${API_BASE}/api/board/game/stream/${gameId}`, { headers: this.headers(), signal })
      if (!res.ok) throw new Error('Failed to open game stream')
      yield* readNDJSON(res, signal)
    }).call(this)
  }

  async move(gameId: string, uci: string) {
    const res = await fetch(`${API_BASE}/api/board/game/${gameId}/move/${uci}`, {
      method: 'POST',
      headers: this.headers(),
    })
    if (!res.ok) throw new Error('Move rejected by Lichess')
  }

  async resign(gameId: string) {
    await fetch(`${API_BASE}/api/board/game/${gameId}/resign`, { method: 'POST', headers: this.headers() })
  }

  /**
   * Both players' ratings for a finished game. Lichess reports the rating the
   * player had when the game STARTED plus `ratingDiff`, so the new rating is
   * `rating + diff`. `diff` is undefined for casual / unrated games, and for a
   * moment after a rated game ends while Lichess settles the ratings.
   * Public endpoint, so no auth header (keeps it a simple, preflight-free request).
   */
  async getGameRatings(gameId: string): Promise<{ white: SideRating; black: SideRating }> {
    const res = await fetch(`${API_BASE}/game/export/${gameId}?moves=false&tags=false&clocks=false&evals=false&opening=false`,
      { headers: { Accept: 'application/json' } })
    if (!res.ok) throw new Error('Could not load game result')
    const g = await res.json()
    const side = (p: any): SideRating => ({
      rating: typeof p?.rating === 'number' ? p.rating : undefined,
      diff: typeof p?.ratingDiff === 'number' ? p.ratingDiff : undefined,
    })
    return { white: side(g.players?.white), black: side(g.players?.black) }
  }

  /** Offer a draw, or answer one the opponent made (`yes` accepts, `no` declines). */
  async draw(gameId: string, answer: 'yes' | 'no') {
    const res = await fetch(`${API_BASE}/api/board/game/${gameId}/draw/${answer}`, { method: 'POST', headers: this.headers() })
    if (!res.ok) throw new Error('Draw request failed')
  }

  async abort(gameId: string) {
    await fetch(`${API_BASE}/api/board/game/${gameId}/abort`, { method: 'POST', headers: this.headers() })
  }
}
