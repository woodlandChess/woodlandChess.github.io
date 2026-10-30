import { useCallback, useMemo, useRef, useState, type KeyboardEvent } from 'react'
import { Chess } from 'chess.js'
import { HomeFrame } from '../components/HomeFrame'
import { IconCalendar, IconPuzzle } from '../components/ModeIcons'
import { pathForMode, type ModeId } from '../routes'
import type { ChessSchool } from '../stockfish'
import { LoreTab } from './LoreTab'
import { MiniBoard, type Mark } from './MiniBoard'
import { MOTIFS, type Motif, type MotifGroup } from './motifs'
import { StrategyTab } from './StrategyTab'
import '../styles/learn.css'

type TabId = 'tactics' | 'strategy' | 'lore'
const TABS: { id: TabId; label: string }[] = [
  { id: 'tactics', label: 'Tactics' },
  { id: 'strategy', label: 'Strategy' },
  { id: 'lore', label: 'Lore' },
]
const STORAGE_KEY = 'woodland-chess:learn-tab'

function readTab(): TabId {
  try {
    const v = sessionStorage.getItem(STORAGE_KEY)
    if (v === 'tactics' || v === 'strategy' || v === 'lore') return v
  } catch { /* storage can be blocked, the default is fine */ }
  return 'tactics'
}

/** One lesson: the position, the idea, and a button that plays the key move on the diagram. */
function MotifCard({ motif }: { motif: Motif }) {
  const [played, setPlayed] = useState(false)
  const after = useMemo(() => {
    const g = new Chess(motif.fen)
    const m = g.move(motif.move)
    return { fen: g.fen(), from: m.from, to: m.to }
  }, [motif])

  const marks: Record<string, Mark> = played ? { [after.from]: 'from', [after.to]: 'to' } : motif.marks
  return (
    <article className="ln-motif" aria-labelledby={`motif-${motif.id}`}>
      <MiniBoard fen={played ? after.fen : motif.fen} marks={marks} arrows={played ? [] : motif.arrows}
        label={`${motif.name}: ${played ? `after ${motif.move}` : 'White to move'}`} />
      <div className="ln-motif-body">
        <h3 id={`motif-${motif.id}`}>{motif.name}</h3>
        {motif.aka && <p className="ln-aka">Also called {motif.aka}</p>}
        <p className="ln-idea">{motif.idea}</p>
        <p className="ln-detail">{motif.detail}</p>
        <p className="ln-result" aria-live="polite">{played ? motif.result : ''}</p>
        <button type="button" className="btn-ghost ln-play" aria-pressed={played} onClick={() => setPlayed(p => !p)}>
          {played ? 'Reset the board' : <>Play <span className="ln-san">{motif.move}</span></>}
        </button>
      </div>
    </article>
  )
}

function TacticsTab({ onNavigate }: { onNavigate: (m: ModeId) => void }) {
  const [group, setGroup] = useState<MotifGroup>('motif')
  const counts = { motif: MOTIFS.filter(m => m.group === 'motif').length, mate: MOTIFS.filter(m => m.group === 'mate').length }
  const shown = MOTIFS.filter(m => m.group === group)
  return (
    <>
      <section className="ln-sec" aria-labelledby="ln-practice">
        <h2 id="ln-practice" className="ln-h">Practice</h2>
        <a className="ln-feature" href={pathForMode('puzzle', import.meta.env.BASE_URL)}
          onClick={e => { if (e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey) { e.preventDefault(); onNavigate('puzzle') } }}>
          <IconPuzzle className="ln-feature-icon" />
          <span className="ln-feature-text">
            <strong>Rated puzzles</strong>
            <span>Real positions from the Lichess database, with hints, streaks and achievements.</span>
          </span>
          <span className="ln-feature-tag"><IconCalendar className="ln-tag-icon" />Daily challenge</span>
          <svg className="ln-feature-arrow" viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8h9M8.5 4l4 4-4 4" /></svg>
        </a>
      </section>

      <section className="ln-sec" aria-labelledby="ln-library">
        <h2 id="ln-library" className="ln-h">Tactics and mates</h2>
        <p className="ln-note">Patterns that decide most games. Play the move on each diagram to see what it does.</p>
        <div className="ln-chips" role="group" aria-label="Choose a group">
          <button type="button" className="ln-chip-btn" aria-pressed={group === 'motif'} onClick={() => setGroup('motif')}>
            Tactics <span>{counts.motif}</span>
          </button>
          <button type="button" className="ln-chip-btn" aria-pressed={group === 'mate'} onClick={() => setGroup('mate')}>
            Checkmate patterns <span>{counts.mate}</span>
          </button>
        </div>
        <div className="ln-motifs">
          {shown.map(m => <MotifCard key={m.id} motif={m} />)}
        </div>
      </section>
    </>
  )
}

export function LearnPage({ onNavigate, onPlaySchool }: {
  onNavigate: (m: ModeId) => void
  onPlaySchool: (school: ChessSchool) => void
}) {
  const [tab, setTabState] = useState<TabId>(readTab)
  const [reading, setReading] = useState(false)
  const onReadingChange = useCallback((r: boolean) => setReading(r), [])
  const refs = useRef<Record<TabId, HTMLButtonElement | null>>({ tactics: null, strategy: null, lore: null })

  const setTab = (next: TabId) => {
    setTabState(next)
    try { sessionStorage.setItem(STORAGE_KEY, next) } catch { /* ignore */ }
  }

  // Arrow keys move between tabs, as in the ARIA tabs pattern.
  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const i = TABS.findIndex(t => t.id === tab)
    const to = e.key === 'ArrowRight' ? (i + 1) % TABS.length
      : e.key === 'ArrowLeft' ? (i + TABS.length - 1) % TABS.length
      : e.key === 'Home' ? 0 : e.key === 'End' ? TABS.length - 1 : -1
    if (to < 0) return
    e.preventDefault()
    setTab(TABS[to].id)
    refs.current[TABS[to].id]?.focus()
  }

  return (
    <HomeFrame
      mode="learn"
      onNavigate={onNavigate}
      titleId="learn-title"
      kicker="Learn"
      title={<>Study the <em>board</em></>}
      copy="Tactics to sharpen your play, strategy to guide it, and the stories and science behind the game."
    >
      <div className="ln">
        <div className="ln-stick" hidden={reading}>
         <div className="ln-tabs" role="tablist" aria-label="Learn sections" onKeyDown={onKey}>
          {TABS.map(t => (
            <button key={t.id} type="button" role="tab" id={`ln-tab-${t.id}`} aria-selected={tab === t.id}
              aria-controls={`ln-panel-${t.id}`} tabIndex={tab === t.id ? 0 : -1}
              ref={el => { refs.current[t.id] = el }} onClick={() => setTab(t.id)}>
              {t.label}
            </button>
          ))}
         </div>
        </div>

        <div role="tabpanel" id={`ln-panel-${tab}`} aria-labelledby={`ln-tab-${tab}`} className="ln-panel">
          {tab === 'tactics' && <TacticsTab onNavigate={onNavigate} />}
          {tab === 'strategy' && <StrategyTab />}
          {tab === 'lore' && <LoreTab onPlaySchool={onPlaySchool} onReadingChange={onReadingChange} />}
        </div>
      </div>
    </HomeFrame>
  )
}
