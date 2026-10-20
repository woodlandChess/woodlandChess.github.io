import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import type { Outcome } from '../sound'
import { PieceAvatar, type AvatarPiece } from './PieceAvatar'

export type RematchState = 'idle' | 'sending' | 'waiting' | 'declined' | 'needs-permission' | 'error'

export interface ResultPlayer {
  name: string
  avatar: AvatarPiece
  /** Rating going into the game. */
  before?: number
  /** Rating change once Lichess has settled it (rated games only). */
  change?: { after: number; diff: number } | null
}

interface GameResultDialogProps {
  outcome: Outcome
  /** "Checkmate", "Resignation", "Time out"… */
  reason: string
  /** "10+0 · Rapid · Rated" */
  info?: string
  rated: boolean
  me: ResultPlayer
  opp: ResultPlayer
  /** False for games without ratings (vs the computer): hides the rating column and notes. */
  ratings?: boolean
  /** Label overrides, e.g. "Play again" / "Change setup" against the computer. */
  rematchLabel?: string
  newGameLabel?: string
  /** A rated game whose new ratings have not arrived yet. */
  ratingsPending: boolean
  canRematch: boolean
  rematch: RematchState
  rematchMessage?: string | null
  /** The opponent has offered a rematch of their own. */
  incomingRematch: boolean
  onRematch: () => void
  onCancelRematch: () => void
  onAcceptRematch: () => void
  onDeclineRematch: () => void
  onGrantPermission: () => void
  onNewGame: () => void
  onHome: () => void
  /** Dismiss and look at the final position. */
  onClose: () => void
}

/** Animates a number toward `to` (instant for reduced-motion). */
function CountUp({ from, to }: { from: number; to: number }) {
  const [value, setValue] = useState(from)
  useEffect(() => {
    if (from === to || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) { setValue(to); return }
    const start = performance.now()
    const duration = 900
    let raf = 0
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration)
      setValue(Math.round(from + (to - from) * (1 - Math.pow(1 - p, 3))))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [from, to])
  return <>{value}</>
}

function PlayerRow({ player, winner, rated, pending, showScore }: { player: ResultPlayer; winner: boolean; rated: boolean; pending: boolean; showScore: boolean }) {
  const c = player.change
  return (
    <li className={`gr-player${winner ? ' is-winner' : ''}`}>
      <span className="gr-avatar" aria-hidden="true"><PieceAvatar piece={player.avatar} /></span>
      <span className="gr-who">
        <strong>{player.name}</strong>
        {winner && <span className="gr-tag">Winner</span>}
      </span>
      {showScore && <span className="gr-score">
        {c ? (
          <>
            <span className="gr-rating" aria-label={`New rating ${c.after}`}>
              <CountUp from={player.before ?? c.after - c.diff} to={c.after} />
            </span>
            <em className={`gm-delta gm-delta--${c.diff > 0 ? 'up' : c.diff < 0 ? 'down' : 'flat'}`}>
              {c.diff > 0 ? '+' : c.diff < 0 ? '−' : '±'}{Math.abs(c.diff)}
            </em>
          </>
        ) : rated && pending ? (
          <span className="gr-rating gr-rating--pending" aria-label="Updating rating">{player.before ?? '—'}</span>
        ) : (
          <span className="gr-rating gr-rating--quiet">{player.before ?? '—'}</span>
        )}
      </span>}
    </li>
  )
}

export function GameResultDialog(p: GameResultDialogProps) {
  const cardRef = useRef<HTMLElement>(null)
  const primaryRef = useRef<HTMLButtonElement>(null)

  // Focus the main action on open and hand focus back on close.
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null
    primaryRef.current?.focus({ preventScroll: true })
    return () => previous?.focus?.({ preventScroll: true })
  }, [])

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') { e.stopPropagation(); p.onClose(); return }
    if (e.key !== 'Tab') return
    const items = cardRef.current?.querySelectorAll<HTMLElement>('button:not([disabled])')
    if (!items?.length) return
    const first = items[0], last = items[items.length - 1]
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus() }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
  }

  const title = p.outcome === 'win' ? 'You won' : p.outcome === 'loss' ? 'You lost' : p.outcome === 'draw' ? 'Draw' : 'Game aborted'
  const winnerMe = p.outcome === 'win'
  const winnerOpp = p.outcome === 'loss'

  const showRatings = p.ratings !== false
  const note =
    !showRatings ? null
    : p.outcome === 'aborted' ? 'The game was aborted - no rating change.'
    : !p.rated ? 'Casual game - ratings are unchanged.'
    : p.ratingsPending ? 'Updating ratings…'
    : !p.me.change && !p.opp.change ? 'Lichess has not published the new ratings yet.'
    : null

  // One primary action, chosen by what is going on with the rematch.
  let primary: { label: string; onClick: () => void; disabled?: boolean }
  if (p.incomingRematch) primary = { label: `Accept rematch`, onClick: p.onAcceptRematch }
  else if (!p.canRematch) primary = { label: 'New opponent', onClick: p.onNewGame }
  else if (p.rematch === 'needs-permission') primary = { label: 'Allow rematches', onClick: p.onGrantPermission }
  else if (p.rematch === 'sending') primary = { label: 'Sending…', onClick: () => {}, disabled: true }
  else if (p.rematch === 'waiting') primary = { label: `Waiting for ${p.opp.name}…`, onClick: () => {}, disabled: true }
  else primary = { label: p.rematchLabel ?? 'Rematch', onClick: p.onRematch }

  const rematchHint =
    p.incomingRematch ? `${p.opp.name} wants a rematch.`
    : p.rematch === 'needs-permission' ? 'Rematches need one extra Lichess permission. You will be sent to Lichess and brought straight back.'
    : p.rematch === 'declined' ? `${p.opp.name} did not accept the rematch.`
    : p.rematch === 'error' ? (p.rematchMessage ?? 'Could not send the rematch.')
    : null

  return (
    <div className="gr-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) p.onClose() }}>
      <section ref={cardRef} className={`gr-card gr-card--${p.outcome}`} role="dialog" aria-modal="true" aria-labelledby="gr-title" onKeyDown={onKeyDown}>
        <button type="button" className="gr-close" aria-label="Close and review the board" onClick={p.onClose}>
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
        </button>

        <p className="gr-kicker">{p.reason}{p.info ? <> <i aria-hidden="true">·</i> {p.info}</> : null}</p>
        <h2 id="gr-title" className={`gr-title gr-title--${p.outcome}`}>{title}</h2>
        <span className="gr-rule" aria-hidden="true" />

        <ul className="gr-players">
          <PlayerRow player={p.me}  winner={winnerMe}  rated={p.rated} pending={p.ratingsPending} showScore={showRatings} />
          <PlayerRow player={p.opp} winner={winnerOpp} rated={p.rated} pending={p.ratingsPending} showScore={showRatings} />
        </ul>

        {note && <p className="gr-note" aria-live="polite">{note}</p>}
        {rematchHint && <p className="gr-note gr-note--accent" role="status">{rematchHint}</p>}

        <div className="gr-actions">
          <button ref={primaryRef} type="button" className="gr-btn gr-btn--primary" disabled={primary.disabled} onClick={primary.onClick}>
            {primary.label}
          </button>

          {p.incomingRematch ? (
            <button type="button" className="gr-btn" onClick={p.onDeclineRematch}>Decline</button>
          ) : p.rematch === 'waiting' ? (
            <button type="button" className="gr-btn" onClick={p.onCancelRematch}>Cancel rematch</button>
          ) : p.canRematch ? (
            <button type="button" className="gr-btn" onClick={p.onNewGame}>{p.newGameLabel ?? 'New opponent'}</button>
          ) : (
            <button type="button" className="gr-btn" onClick={p.onClose}>Review board</button>
          )}
        </div>

        <div className="gr-links">
          {(p.canRematch || p.incomingRematch) && <button type="button" onClick={p.onClose}>Review board</button>}
          <button type="button" onClick={p.onHome}>Back to home</button>
        </div>
      </section>
    </div>
  )
}
