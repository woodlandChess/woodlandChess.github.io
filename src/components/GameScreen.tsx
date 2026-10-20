import { useEffect, useRef, useState, type ReactNode } from 'react'

export type GameTone = 'turn' | 'wait' | 'over'

interface GameScreenProps {
  exitLabel: string
  onExit: () => void
  opponent: { name: string; meta: string; glyph: string }
  status: string
  tone: GameTone
  moves: string[]
  selectedPly?: number
  onSelectPly?: (ply: number) => void
  material?: { white: number; black: number }
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

function MoveList({ moves, selectedPly, onSelectPly }: { moves: string[]; selectedPly?: number; onSelectPly?: (ply: number) => void }) {
  const ref = useRef<HTMLOListElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (selectedPly === undefined) { el.scrollTop = el.scrollHeight; el.scrollLeft = el.scrollWidth }
  }, [moves.length, selectedPly])

  const rows = Math.ceil(moves.length / 2)
  if (!rows) return <p className="gm-empty">Opening position</p>

  return (
    <ol className="gm-moves" ref={ref} aria-label="Move history">
      {Array.from({ length: rows }, (_, i) => (
        <li className="gm-move-row" key={i}>
          <span className="gm-move-no">{i + 1}.</span>
          <button type="button" onClick={() => onSelectPly?.(i * 2 + 1)} className={`gm-move${(selectedPly ?? moves.length) === i * 2 + 1 ? ' is-last' : ''}`}>{moves[i * 2]}</button>
          <button type="button" disabled={!moves[i * 2 + 1]} onClick={() => onSelectPly?.(i * 2 + 2)} className={`gm-move${(selectedPly ?? moves.length) === i * 2 + 2 ? ' is-last' : ''}`}>{moves[i * 2 + 1] ?? ''}</button>
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
  notice, actions, children, overlay, selectedPly, onSelectPly, material,
}: GameScreenProps) {
  const [wide] = useState(() => typeof window !== 'undefined' && window.matchMedia('(min-width: 1000px)').matches)

  return (
    <main className="gm">
      <div className="gm-head">
        <div className="brand">
          <span className="brand-mark">♞</span>
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
          <div className="gm-history-top"><p className="gm-label">Moves</p>{material && <div className="gm-material" aria-label="Material score"><span>White <b>{material.white}</b></span><span>Black <b>{material.black}</b></span><span>Balance <b>{material.white - material.black > 0 ? '+' : ''}{material.white - material.black}</b></span></div>}</div>
          <MoveList moves={moves} selectedPly={selectedPly} onSelectPly={onSelectPly} />
          {onSelectPly && <div className="gm-review"><button type="button" disabled={!selectedPly} onClick={() => onSelectPly(Math.max(0, (selectedPly ?? 0) - 1))}>← Previous</button><span>{selectedPly ?? moves.length} / {moves.length}</span><button type="button" disabled={(selectedPly ?? moves.length) >= moves.length} onClick={() => onSelectPly(Math.min(moves.length, (selectedPly ?? moves.length) + 1))}>Next →</button></div>}
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
