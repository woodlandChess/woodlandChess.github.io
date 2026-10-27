/**
 * Connection helpers for the live Lichess streams.
 *
 * Lichess streams send a blank keep-alive line every few seconds. A phone that loses signal (tunnel, lift,
 * switching between Wi-Fi and mobile data, app in the background) often leaves the request open and silent
 * instead of failing, so the app has to notice the silence itself.
 */

/** No data (not even a keep-alive) for this long means the connection is dead. */
export const STALE_AFTER_MS = 20_000

export interface Watchdog {
  /** Call whenever anything arrives on the stream. */
  touch(): void
  stop(): void
}

/** Calls `onStale` once if `touch()` has not been called for `staleMs`. */
export function startWatchdog(
  staleMs: number, onStale: () => void, tickMs = 3000, now: () => number = () => Date.now(),
): Watchdog {
  let last = now()
  let fired = false
  const timer = setInterval(() => {
    if (!fired && now() - last > staleMs) { fired = true; onStale() }
  }, tickMs)
  return {
    touch() { last = now(); fired = false },
    stop() { clearInterval(timer) },
  }
}

/** Wait before reconnect attempt number `attempt` (0, 1, 2, ...): 1s, 2s, 4s, then at most 8s. */
export const backoff = (attempt: number) => Math.min(1000 * 2 ** attempt, 8000)

/**
 * Runs `onWake` when the page is likely to have a working network again (it came back online, the tab became
 * visible, or it was restored from the back/forward cache) and `onSleep` when the network goes away.
 * Returns an unsubscribe function.
 */
export function watchNetwork(onWake: () => void, onSleep: () => void): () => void {
  const wake = () => { if (typeof document === 'undefined' || document.visibilityState !== 'hidden') onWake() }
  const visible = () => { if (document.visibilityState === 'visible') onWake() }
  window.addEventListener('online', wake)
  window.addEventListener('offline', onSleep)
  window.addEventListener('pageshow', wake)
  document.addEventListener('visibilitychange', visible)
  return () => {
    window.removeEventListener('online', wake)
    window.removeEventListener('offline', onSleep)
    window.removeEventListener('pageshow', wake)
    document.removeEventListener('visibilitychange', visible)
  }
}

/** Errors that mean "the request never reached Lichess" (as opposed to Lichess saying no). */
export const isNetworkError = (e: unknown) => e instanceof TypeError || (e instanceof DOMException && e.name === 'NetworkError')
