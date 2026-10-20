import { useEffect, useRef, useState, type ReactNode } from 'react'

import { BrandMark } from './BrandMark'

export type GameTone = 'turn' | 'wait' | 'over'

interface GameScreenProps {
  exitLabel: string
  onExit: () => void
  opponent: { name: string; meta: string; glyph: string }
  status: string
  tone: GameTone
  moves: string[]
  /** Optional profile block (e.g. school weights). Collapsible on phones. */
  profile?: ReactNode
  profileLabel?: string
  notice?: string | null
  actions: ReactNode
  /** The board. */
  children: ReactNode
  /** Modals, e.g. promotion picker. */
  overlay?: ReactNode
}

function MoveList({ moves }: { moves: string[] }) {
  const ref = useRef<HTMLOListElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    el.scrollTop = el.scrollHeight
    el.scrollLeft = el.scrollWidth
  }, [moves.length])

  const rows = Math.ceil(moves.length / 2)
  if (!rows) return <p className="gm-empty">Opening position</p>

  return (
    <ol className="gm-moves" ref={ref} aria-label="Move history">
      {Array.from({ length: rows }, (_, i) => (
        <li className="gm-move-row" key={i}>
          <span className="gm-move-no">{i + 1}.</span>
          <span className={`gm-move${moves.length - 1 === i * 2 ? ' is-last' : ''}`}>{moves[i * 2]}</span>
          <span className={`gm-move${moves.length - 1 === i * 2 + 1 ? ' is-last' : ''}`}>{moves[i * 2 + 1] ?? ''}</span>
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
 *   phone    opponent strip → board → status → moves → profile → actions
 *   desktop  board left; opponent / status / moves / profile / actions column right
 */
export function GameScreen({
  exitLabel, onExit, opponent, status, tone, moves, profile, profileLabel = 'Profile',
  notice, actions, children, overlay,
}: GameScreenProps) {
  const [wide] = useState(() => typeof window !== 'undefined' && window.matchMedia('(min-width: 1000px)').matches)

  return (
    <main className="gm">
      <div className="gm-head">
        <div className="brand">
          <BrandMark />
          <span className="brand-name">Woodland Chess</span>
        </div>
        <button type="button" className="new-game" onClick={onExit}>{exitLabel}</button>
      </div>

      <div className="gm-body">
        <div className="gm-card gm-opp">
          <div className="gm-avatar" aria-hidden="true">{opponent.glyph}</div>
          <div className="gm-opp-info">
            <strong>{opponent.name}</strong>
            <span>{opponent.meta}</span>
          </div>
        </div>

        <div className="gm-board">{children}</div>

        <div className="gm-stack">
          <div className={`gm-card gm-status gm-status--${tone}`} role="status" aria-live="polite">
            <i className="gm-status-dot" aria-hidden="true" />
            <span className="gm-status-text">{status}</span>
            {tone === 'wait' && <span className="gm-dots" aria-hidden="true"><i /><i /><i /></span>}
          </div>
          {notice && <p className="gm-notice" role="alert">{notice}</p>}
        </div>

        <div className="gm-card gm-history">
          <p className="gm-label">Moves</p>
          <MoveList moves={moves} />
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
