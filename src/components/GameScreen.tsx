import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { clockTone, formatClock } from '../clock'

import { BrandMark } from './BrandMark'

export type GameTone = 'turn' | 'wait' | 'over'

/** What a player strip needs to show a live clock. `read` returns ms remaining right now. */
export interface ClockView {
  read: () => number
  active: boolean
}

/** Rating after a finished rated game: `after` = new rating, `diff` = change. */
export interface RatingChange { after: number; diff: number }

interface Player { name: string; meta: string; glyph: string; ratingChange?: RatingChange | null }

/** Live `matchMedia` flag, so layout-dependent behaviour follows rotation and resizing. */
function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => typeof window !== 'undefined' && window.matchMedia(query).matches)
  useEffect(() => {
    const mq = window.matchMedia(query)
    const on = () => setMatches(mq.matches)
    on()
    mq.addEventListener?.('change', on)
    return () => mq.removeEventListener?.('change', on)
  }, [query])
  return matches
}

interface GameScreenProps {
  exitLabel: string
  /** When set, the exit button needs a second tap (labelled with this text) - for live games. */
  exitConfirmLabel?: string
  onExit: () => void
  opponent: Player
  opponentClock?: ClockView | null
  /** Optional strip for the local player (shown under the board, with their clock). */
  self?: Player
  selfClock?: ClockView | null
  status: string
  /** Small mono caption on the right of the status card, e.g. "10+0 · Rapid · Rated". */
  statusMeta?: string
  tone: GameTone
  moves: string[]
  selectedPly?: number
  onSelectPly?: (ply: number) => void
  material?: { white: number; black: number }
  /** Optional profile block (e.g. school weights). Collapsible on phones. */
  profile?: ReactNode
  profileLabel?: string
  notice?: string | null
  /** Extra card under the status, e.g. a draw offer to answer. */
  extra?: ReactNode
  actions: ReactNode
  /** The board. */
  children: ReactNode
  /** Modals, e.g. promotion picker. */
  overlay?: ReactNode
}

// ── Clock ─────────────────────────────────────────────────────────────────────
/**
 * Self-contained ticking clock: it re-renders only itself (not the board) and
 * only when the visible text changes.
 */
function GameClock({ view, label }: { view: ClockView; label: string }) {
  const readRef = useRef(view.read)
  readRef.current = view.read
  const [ms, setMs] = useState(() => view.read())

  useEffect(() => {
    setMs(readRef.current())
    if (!view.active) return
    const t = window.setInterval(() => setMs(readRef.current()), 100)
    return () => window.clearInterval(t)
  }, [view.active])

  // The parent hands over a fresh `read` whenever it re-renders (new move, server
  // correction), so re-sync the display then. Depends on identity only - no loop.
  useEffect(() => { setMs(view.read()) }, [view.read])

  const tone = clockTone(ms)
  return (
    <span
      className={`gm-clock gm-clock--${tone}${view.active ? ' is-active' : ''}`}
      role="timer"
      aria-label={`${label} clock`}
    >
      {formatClock(ms)}
    </span>
  )
}

function PlayerStrip({ player, clock, className }: { player: Player; clock?: ClockView | null; className: string }) {
  return (
    <div className={`gm-card gm-player ${className}${clock?.active ? ' is-on-move' : ''}`}>
      <div className="gm-avatar" aria-hidden="true">{player.glyph}</div>
      <div className="gm-opp-info">
        <strong>{player.name}</strong>
        <span className="gm-opp-meta">
          {player.ratingChange ? (
            <>
              Rating <b>{player.ratingChange.after}</b>
              <em className={`gm-delta gm-delta--${player.ratingChange.diff > 0 ? 'up' : player.ratingChange.diff < 0 ? 'down' : 'flat'}`}>
                {player.ratingChange.diff > 0 ? '+' : player.ratingChange.diff < 0 ? '−' : '±'}{Math.abs(player.ratingChange.diff)}
              </em>
            </>
          ) : player.meta}
        </span>
      </div>
      {clock && <GameClock view={clock} label={player.name} />}
    </div>
  )
}

// ── Move list ─────────────────────────────────────────────────────────────────
/**
 * Newest move first on desktop/tablet-landscape (a vertical list: the latest move
 * is always at the top, no scrolling needed; scroll only to look back). On phones
 * it is a sideways ticker in playing order that rests on the newest move.
 * It only ever scrolls its own box - never the page - and it leaves you alone if
 * you have scrolled away to read old moves.
 */
function MoveList({ moves, selectedPly, onSelectPly }: { moves: string[]; selectedPly?: number; onSelectPly?: (ply: number) => void }) {
  const ref = useRef<HTMLOListElement>(null)
  const newestFirst = useMediaQuery('(min-width: 1000px)')
  const following = selectedPly === undefined || selectedPly >= moves.length
  const wasFollowing = useRef(true)

  const toNewest = () => {
    const el = ref.current
    if (!el) return
    if (newestFirst) el.scrollTop = 0
    else el.scrollLeft = el.scrollWidth
  }

  const reveal = () => {
    const el = ref.current
    if (!el) return
    const active = el.querySelector<HTMLElement>('[data-active="true"]')
    if (!active) return
    const c = el.getBoundingClientRect()
    const a = active.getBoundingClientRect()
    const pad = 12
    if (a.top < c.top + pad) el.scrollTop -= c.top + pad - a.top
    else if (a.bottom > c.bottom - pad) el.scrollTop += a.bottom - (c.bottom - pad)
    if (a.left < c.left + pad) el.scrollLeft -= c.left + pad - a.left
    else if (a.right > c.right - pad) el.scrollLeft += a.right - (c.right - pad)
  }

  // Before paint, so there is never a frame showing the wrong end of the list.
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    // What this update should do with the scroll position:
    //   'reveal'  stepping back through the game: keep the viewed move on screen
    //   'newest'  back on the live position, or the ticker is resting on the newest move
    //   'stay'    vertical list at the top stays put; if you scrolled away you keep your place
    let action: 'reveal' | 'newest' | 'stay' = 'stay'
    if (!following) action = 'reveal'
    else if (!wasFollowing.current) action = 'newest'
    else if (!newestFirst && (el.scrollLeft === 0 || el.scrollWidth - el.clientWidth - el.scrollLeft < 80)) action = 'newest'
    wasFollowing.current = following

    const run = () => { if (action === 'reveal') reveal(); else if (action === 'newest') toNewest() }
    run()
    // Fonts / grid sizing can settle a frame later (first mount with a long game).
    const raf = requestAnimationFrame(run)
    return () => cancelAnimationFrame(raf)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [moves.length, selectedPly, newestFirst])

  // Layout can settle after first paint (fonts, rotation): rest on the newest move again.
  useEffect(() => {
    const el = ref.current
    if (!el || typeof ResizeObserver === 'undefined') return
    let first = true
    const ro = new ResizeObserver(() => { if (first) { first = false; return } if (following) toNewest() })
    ro.observe(el)
    return () => ro.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [moves.length > 0, following, newestFirst])

  const rows = Math.ceil(moves.length / 2)
  if (!rows) return <p className="gm-empty">Opening position</p>

  const current = selectedPly ?? moves.length
  const cell = (ply: number, san?: string) => (
    <button
      type="button"
      disabled={!san}
      onClick={() => onSelectPly?.(ply)}
      data-active={current === ply ? 'true' : undefined}
      aria-current={current === ply ? 'step' : undefined}
      className={`gm-move${current === ply ? ' is-last' : ''}`}
    >{san ?? ''}</button>
  )

  const order = Array.from({ length: rows }, (_, i) => i)
  if (newestFirst) order.reverse()

  return (
    <ol className="gm-moves" ref={ref} aria-label="Move history">
      {order.map(i => (
        <li className="gm-move-row" key={i}>
          <span className="gm-move-no">{i + 1}.</span>
          {cell(i * 2 + 1, moves[i * 2])}
          {cell(i * 2 + 2, moves[i * 2 + 1])}
        </li>
      ))}
    </ol>
  )
}

/** Two-step button for destructive actions: first tap arms, second confirms. */
export function ConfirmButton({ label, confirmLabel, onConfirm, className = '' }: {
  label: string; confirmLabel: string; onConfirm: () => void; className?: string
}) {
  const [armed, setArmed] = useState(false)
  useEffect(() => {
    if (!armed) return
    const t = window.setTimeout(() => setArmed(false), 3000)
    return () => window.clearTimeout(t)
  }, [armed])
  return (
    <button type="button" className={`${className}${armed ? ' is-armed' : ''}`}
      onClick={() => { if (armed) { setArmed(false); onConfirm() } else setArmed(true) }}>
      {armed ? confirmLabel : label}
    </button>
  )
}

/**
 * In-game layout shared by Computer and Online play.
 *   phone    opponent → board → you → status → moves → profile → actions (pinned)
 *   desktop  board left; opponent / status / moves / you / profile / actions right
 * The "you" strip only exists when `self` is passed (online play, where clocks matter).
 */
export function GameScreen({
  exitLabel, exitConfirmLabel, onExit, opponent, opponentClock, self, selfClock,
  status, statusMeta, tone, moves, profile, profileLabel = 'Profile',
  notice, extra, actions, children, overlay, selectedPly, onSelectPly, material,
}: GameScreenProps) {
  const wide = useMediaQuery('(min-width: 1000px)')

  // The game is exactly one viewport tall; lock the document so no page scrollbar
  // can appear (e.g. a 1px mismatch while a mobile browser's address bar collapses).
  useEffect(() => {
    const root = document.documentElement
    root.classList.add('is-game')
    return () => root.classList.remove('is-game')
  }, [])

  return (
    <main className="gm">
      <div className="gm-head">
        <div className="brand">
          <BrandMark />
          <span className="brand-name">Woodland Chess</span>
        </div>
        {exitConfirmLabel
          ? <ConfirmButton className="new-game" label={exitLabel} confirmLabel={exitConfirmLabel} onConfirm={onExit} />
          : <button type="button" className="new-game" onClick={onExit}>{exitLabel}</button>}
      </div>

      <div className={`gm-body${self ? ' gm-body--me' : ''}`}>
        <PlayerStrip player={opponent} clock={opponentClock} className="gm-opp" />

        <div className="gm-board">{children}</div>

        {self && <PlayerStrip player={self} clock={selfClock} className="gm-me" />}

        <div className="gm-stack">
          <div className={`gm-card gm-status gm-status--${tone}`} role="status" aria-live="polite">
            <i className="gm-status-dot" aria-hidden="true" />
            <span className="gm-status-text">{status}</span>
            {statusMeta && <span className="gm-status-meta">{statusMeta}</span>}
            {tone === 'wait' && <span className="gm-dots" aria-hidden="true"><i /><i /><i /></span>}
          </div>
          {notice && <p className="gm-notice" role="alert">{notice}</p>}
          {extra}
        </div>

        <div className="gm-card gm-history">
          <div className="gm-history-top"><p className="gm-label">Moves</p>{material && <div className="gm-material" aria-label="Material score"><span>White <b>{material.white}</b></span><span>Black <b>{material.black}</b></span><span>Balance <b>{material.white - material.black > 0 ? '+' : ''}{material.white - material.black}</b></span></div>}</div>
          <MoveList moves={moves} selectedPly={selectedPly} onSelectPly={onSelectPly} />
          {onSelectPly && (
            <div className="gm-review">
              <button type="button" className="gm-review-prev" aria-label="Previous move" disabled={!selectedPly} onClick={() => onSelectPly(Math.max(0, (selectedPly ?? 0) - 1))}><span aria-hidden="true">←</span><span className="gm-review-txt"> Previous</span></button>
              <span className="gm-review-count">{selectedPly ?? moves.length} / {moves.length}</span>
              <button type="button" className="gm-review-next" aria-label="Next move" disabled={(selectedPly ?? moves.length) >= moves.length} onClick={() => onSelectPly(Math.min(moves.length, (selectedPly ?? moves.length) + 1))}><span className="gm-review-txt">Next </span><span aria-hidden="true">→</span></button>
            </div>
          )}
        </div>

        {profile && (
          <details className="gm-card gm-profile" open={wide}>
            <summary className="gm-label">{profileLabel}</summary>
            <div className="gm-profile-body">{profile}</div>
          </details>
        )}

        <div className="gm-actions">{actions}</div>
      </div>

      {overlay}
    </main>
  )
}
