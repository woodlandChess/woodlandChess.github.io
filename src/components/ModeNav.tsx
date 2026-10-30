import { useEffect, useRef, useState, type CSSProperties, type MouseEvent } from 'react'
import { IconAnalyze, IconComputer, IconHome, IconLearn, IconOnline } from './ModeIcons'
import { preloadMode } from '../lazyModes'
import { pathForMode, type ModeId } from '../routes'
import '../styles/tabbar.css'

export type { ModeId } from '../routes'

type TabId = Exclude<ModeId, 'puzzle'>

/** Left to right: [ai][multiplayer][home][analyze][learn]. Home sits in the middle. */
const tabs: { id: TabId; label: string; full: string; Icon: typeof IconHome }[] = [
  { id: 'ai',      label: 'AI',      full: 'Play the computer',   Icon: IconComputer },
  { id: 'online',  label: 'Multiplayer', full: 'Multiplayer',         Icon: IconOnline },
  { id: 'home',    label: 'Home',    full: 'Home',                Icon: IconHome },
  { id: 'profile', label: 'Analyze', full: 'Analyze your games',  Icon: IconAnalyze },
  { id: 'learn',   label: 'Learn',   full: 'Learn and practice',  Icon: IconLearn },
]

/** Puzzles live under Learn, so they keep the Learn tab lit. */
const tabFor = (mode: ModeId): TabId => (mode === 'puzzle' ? 'learn' : mode)

/** Remembered across screens so the indicator slides from the previous tab instead of popping in. */
let lastIndex = -1

const typing = (el: EventTarget | null) => {
  const n = el as HTMLElement | null
  return !!n && (n.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(n.tagName))
}

/**
 * Primary navigation, shared by every menu-level screen: a mobile-first bottom
 * tab bar that becomes a floating dock on larger screens. Tabs are real links
 * (open in a new tab, copy link), and keys 1 to 5 jump between them on desktop.
 */
export function ModeNav({ current, onSelect }: { current: ModeId; onSelect: (m: ModeId) => void }) {
  const active = tabFor(current)
  const index = Math.max(0, tabs.findIndex(t => t.id === active))
  const [shown, setShown] = useState(lastIndex < 0 ? index : lastIndex)
  const currentRef = useRef(current)
  currentRef.current = current
  const selectRef = useRef(onSelect)
  selectRef.current = onSelect

  useEffect(() => {
    lastIndex = index
    // Two frames: the first paint keeps the old position, the second starts the slide.
    let raf2 = 0
    const raf1 = requestAnimationFrame(() => { raf2 = requestAnimationFrame(() => setShown(index)) })
    return () => { cancelAnimationFrame(raf1); cancelAnimationFrame(raf2) }
  }, [index])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey || e.shiftKey || typing(e.target)) return
      const tab = tabs[Number(e.key) - 1]
      if (tab && tab.id !== currentRef.current) { e.preventDefault(); selectRef.current(tab.id) }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const go = (e: MouseEvent<HTMLAnchorElement>, id: TabId) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
    e.preventDefault()
    if (id !== current) onSelect(id)
  }

  return (
    <nav className="tabbar" aria-label="Woodland Chess sections" style={{ '--i': shown } as CSSProperties}>
      <span className="tabbar-indicator" aria-hidden="true" />
      {tabs.map(({ id, label, full, Icon }, n) => (
        <a key={id} href={pathForMode(id, import.meta.env.BASE_URL)}
          className={`tab${id === 'home' ? ' tab--home' : ''}`}
          aria-current={id === active ? 'page' : undefined}
          title={`${full} (${n + 1})`}
          onPointerEnter={() => preloadMode(id)}
          onFocus={() => preloadMode(id)}
          onTouchStart={() => preloadMode(id)}
          onClick={e => go(e, id)}>
          <span className="tab-icon"><Icon className="tab-glyph" /></span>
          <span className="tab-label">{label}</span>
        </a>
      ))}
    </nav>
  )
}
