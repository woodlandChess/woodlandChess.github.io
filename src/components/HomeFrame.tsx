import type { ReactNode } from 'react'
import { BrandMark } from './BrandMark'
import { ModeNav, type ModeId } from './ModeNav'
import { pathForMode } from '../routes'

interface HomeFrameProps {
  mode: ModeId
  onNavigate: (m: ModeId) => void
  kicker: string
  title: ReactNode
  titleId?: string
  copy?: ReactNode
  /** Single-column card (Online / Puzzle menus). Default is the wide two-column card. */
  compact?: boolean
  busy?: boolean
  /** Small control shown opposite the brand (e.g. a sound toggle). */
  headExtra?: ReactNode
  /** Pinned action bar: thumb-zone on phones, footer row on larger screens. */
  actions?: ReactNode
  children?: ReactNode
}

/**
 * The shared frame for every menu-level screen: brand lockup, intro block,
 * content and action bar, with the bottom tab bar pinned below. Keeping this in one
 * place is what makes Computer, Online and Puzzles feel like one product.
 */
export function HomeFrame({
  mode, onNavigate, kicker, title, titleId = 'home-title', copy,
  compact = false, busy = false, headExtra, actions, children,
}: HomeFrameProps) {
  return (
    <main className="setup-shell setup-shell--home">
      <section
        className={`setup-card setup-card--home${compact ? ' setup-card--compact' : ''}`}
        aria-labelledby={titleId}
        aria-busy={busy || undefined}
      >
        <div className="home-head">
          <div className="home-top">
            <a className="brand" href={pathForMode('home', import.meta.env.BASE_URL)} aria-label="Woodland Chess, home"
              onClick={e => {
                if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
                e.preventDefault()
                onNavigate('home')
              }}>
              <BrandMark />
              <span className="brand-name">Woodland Chess</span>
            </a>
            {headExtra}
          </div>
        </div>

        <div className="home-intro">
          <span className="setup-kicker">{kicker}</span>
          <h1 id={titleId}>{title}</h1>
          {copy && <p className="setup-copy">{copy}</p>}
        </div>

        {children}

        {actions && <div className="home-actions">{actions}</div>}
      </section>
      <ModeNav current={mode} onSelect={onNavigate} />
    </main>
  )
}
