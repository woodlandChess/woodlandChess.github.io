import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { backoff, isNetworkError, startWatchdog, STALE_AFTER_MS, LichessHttpError, isAuthError, isGone, isTransient, retryDelay, sleepUnlessWoken } from './connection'
import { LichessClient, MoveRejectedError } from './lichess'

describe('startWatchdog', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('fires once when nothing arrives for the stale period', () => {
    const stale = vi.fn()
    const dog = startWatchdog(20_000, stale, 1000)
    vi.advanceTimersByTime(19_000)
    expect(stale).not.toHaveBeenCalled()
    vi.advanceTimersByTime(3_000)
    expect(stale).toHaveBeenCalledTimes(1)
    vi.advanceTimersByTime(30_000)
    expect(stale).toHaveBeenCalledTimes(1)               // reported once, not every tick
    dog.stop()
  })
  it('stays quiet while data (even blank keep-alives) keeps arriving', () => {
    const stale = vi.fn()
    const dog = startWatchdog(20_000, stale, 1000)
    for (let i = 0; i < 10; i++) { vi.advanceTimersByTime(7_000); dog.touch() }
    expect(stale).not.toHaveBeenCalled()
    dog.stop()
  })
  it('can fire again after the stream recovers and goes quiet again', () => {
    const stale = vi.fn()
    const dog = startWatchdog(5_000, stale, 1000)
    vi.advanceTimersByTime(7_000); expect(stale).toHaveBeenCalledTimes(1)
    dog.touch()
    vi.advanceTimersByTime(7_000); expect(stale).toHaveBeenCalledTimes(2)
    dog.stop()
  })
  it('does nothing after stop()', () => {
    const stale = vi.fn()
    startWatchdog(1_000, stale, 500).stop()
    vi.advanceTimersByTime(60_000)
    expect(stale).not.toHaveBeenCalled()
  })
  it('the real threshold allows a few missed keep-alives but not a dead link', () => {
    expect(STALE_AFTER_MS).toBeGreaterThanOrEqual(15_000)
    expect(STALE_AFTER_MS).toBeLessThanOrEqual(30_000)
  })
})

describe('backoff', () => {
  it('doubles from one second and stops at eight', () => {
    expect([0, 1, 2, 3, 4, 9].map(backoff)).toEqual([1000, 2000, 4000, 8000, 8000, 8000])
  })
})

describe('isNetworkError', () => {
  it('treats fetch failures as network errors and Lichess refusals as not', () => {
    expect(isNetworkError(new TypeError('Failed to fetch'))).toBe(true)
    expect(isNetworkError(new MoveRejectedError('nope', 400))).toBe(false)
    expect(isNetworkError(new Error('x'))).toBe(false)
  })
})

describe('LichessClient move and ongoing games', () => {
  afterEach(() => vi.unstubAllGlobals())
  const reply = (status: number, body: unknown) => vi.fn().mockResolvedValue(new Response(JSON.stringify(body), { status }))

  it('a 400 from Lichess is a MoveRejectedError carrying its message', async () => {
    vi.stubGlobal('fetch', reply(400, { error: 'Not your turn, or game already over' }))
    await expect(new LichessClient('t').move('g1', 'e2e4')).rejects.toMatchObject({ name: 'MoveRejectedError', status: 400, message: 'Not your turn, or game already over' })
  })
  it('a dropped connection stays a network error so the caller can retry', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')))
    const err = await new LichessClient('t').move('g1', 'e2e4').catch(e => e)
    expect(isNetworkError(err)).toBe(true)
    expect(err).not.toBeInstanceOf(MoveRejectedError)
  })
  it('a server error or rate limit is retryable, not "your move is wrong"', async () => {
    for (const status of [429, 500, 503]) {
      vi.stubGlobal('fetch', reply(status, {}))
      const err = await new LichessClient('t').move('g1', 'e2e4').catch(e => e)
      expect(isNetworkError(err)).toBe(true)
    }
  })
  it('reads the list of ongoing games', async () => {
    vi.stubGlobal('fetch', reply(200, { nowPlaying: [{ gameId: 'abcd1234', color: 'black', variant: { key: 'standard' } }] }))
    expect(await new LichessClient('t').getOngoingGames()).toEqual([{ gameId: 'abcd1234', color: 'black', variant: { key: 'standard' } }])
    vi.stubGlobal('fetch', reply(200, {}))
    expect(await new LichessClient('t').getOngoingGames()).toEqual([])
  })
})

describe('stream activity', () => {
  afterEach(() => vi.unstubAllGlobals())
  it('reports every chunk, including blank keep-alive lines, so silence can be detected', async () => {
    const enc = new TextEncoder()
    const body = new ReadableStream({ start(c) { c.enqueue(enc.encode('\n')); c.enqueue(enc.encode('{"type":"gameFull"}\n')); c.enqueue(enc.encode('\n')); c.close() } })
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(body, { status: 200 })))
    const touches = vi.fn()
    const events: unknown[] = []
    for await (const e of new LichessClient('t').streamGame('g1', undefined, touches)) events.push(e)
    expect(events).toEqual([{ type: 'gameFull' }])
    expect(touches.mock.calls.length).toBeGreaterThanOrEqual(3)
  })
})

describe('retry policy', () => {
  const http = (status: number) => new LichessHttpError(`HTTP ${status}`, status)

  it('only a 401 means the login is gone', () => {
    expect(isAuthError(http(401))).toBe(true)
    for (const s of [403, 404, 429, 500, 503]) expect(isAuthError(http(s))).toBe(false)
    expect(isAuthError(new TypeError('Failed to fetch'))).toBe(false)
  })

  it('a network failure or a Lichess hiccup is worth another try, a refusal is not', () => {
    expect(isTransient(new TypeError('Failed to fetch'))).toBe(true)
    for (const s of [408, 429, 500, 502, 503]) expect(isTransient(http(s))).toBe(true)
    for (const s of [400, 401, 403, 404]) expect(isTransient(http(s))).toBe(false)
  })

  it('a game that does not exist is gone for good', () => {
    expect(isGone(http(404))).toBe(true)
    expect(isGone(http(410))).toBe(true)
    expect(isGone(http(500))).toBe(false)
    expect(isGone(new TypeError('x'))).toBe(false)
  })

  it('waits a full minute after "too many requests", otherwise backs off gently', () => {
    expect(retryDelay(http(429), 0)).toBe(60_000)
    expect(retryDelay(http(500), 0)).toBe(1000)
    expect(retryDelay(new TypeError('x'), 3)).toBe(8000)
    expect(retryDelay(null, 10)).toBe(8000)
  })

  it('sleepUnlessWoken returns early when the network comes back', async () => {
    const t0 = Date.now()
    const win = new EventTarget()
    const p = sleepUnlessWoken(5000, win, undefined)
    win.dispatchEvent(new Event('online'))
    await p
    expect(Date.now() - t0).toBeLessThan(1000)
  })

  it('sleepUnlessWoken also wakes when the tab becomes visible', async () => {
    const doc = Object.assign(new EventTarget(), { visibilityState: 'visible' })
    const t0 = Date.now()
    const p = sleepUnlessWoken(5000, undefined, doc)
    doc.dispatchEvent(new Event('visibilitychange'))
    await p
    expect(Date.now() - t0).toBeLessThan(1000)
  })

  it('sleepUnlessWoken still ends by itself', async () => {
    const t0 = Date.now()
    await sleepUnlessWoken(30, new EventTarget(), undefined)
    expect(Date.now() - t0).toBeGreaterThanOrEqual(25)
  })
})

describe('Lichess client errors carry the HTTP status', () => {
  const reply = (status: number) => vi.stubGlobal('fetch', vi.fn(async () => ({ ok: status >= 200 && status < 300, status, json: async () => ({}), body: null })))
  afterEach(() => vi.unstubAllGlobals())

  it('a rejected token is a 401 the screen can recognise', async () => {
    reply(401)
    const err = await new LichessClient('t').getProfile().catch(e => e)
    expect(err).toBeInstanceOf(LichessHttpError)
    expect(isAuthError(err)).toBe(true)
  })

  it('a Lichess outage is transient, not a reason to sign out', async () => {
    reply(503)
    const err = await new LichessClient('t').getProfile().catch(e => e)
    expect(isAuthError(err)).toBe(false)
    expect(isTransient(err)).toBe(true)
  })

  it('a failed check for ongoing games is an error to retry, not "no game"', async () => {
    reply(500)
    await expect(new LichessClient('t').getOngoingGames()).rejects.toBeInstanceOf(LichessHttpError)
  })

  it('a game that no longer exists is reported as gone', async () => {
    reply(404)
    const run = async () => { for await (const _ of new LichessClient('t').streamGame('zzzz', new AbortController().signal)) void _ }
    const err = await run().catch(e => e)
    expect(isGone(err)).toBe(true)
  })
})
