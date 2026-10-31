import { useCallback, useMemo, useRef, useState, type KeyboardEvent } from 'react'
import { HomeFrame } from '../components/HomeFrame'
import { IconCalendar, IconPuzzle } from '../components/ModeIcons'
import { pathForMode, type ModeId } from '../routes'
import type { ChessSchool } from '../stockfish'
import { ArticleLibrary } from './ArticleLibrary'
import { moveText, replay } from './lesson'
import { LORE } from './lore'
import { MiniBoard, type Mark } from './MiniBoard'
import { GROUPS, MOTIFS, type Motif, type MotifGroup } from './motifs'
import { STRATEGY } from './strategy'
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

/** A concept card: an idea with no diagram, plus what to look for. */
function ConceptCard({ motif }: { motif: Motif }) {
  return (
    <article className="ln-motif ln-motif--concept" aria-labelledby={`motif-${motif.id}`}>
      <div className="ln-motif-body">
        <p className="ln-aka">Concept{motif.aka ? ` · also ${motif.aka}` : ''}</p>
        <h3 id={`motif-${motif.id}`}>{motif.name}</h3>
        <p className="ln-idea">{motif.idea}</p>
        <p className="ln-detail">{motif.detail}</p>
        {motif.spot && (
          <>
            <p className="ln-subhead">How to spot it</p>
            <ul className="ln-ul">{motif.spot.map(t => <li key={t}>{t}</li>)}</ul>
          </>
        )}
        {motif.see && <p className="ln-see">{motif.see}</p>}
      </div>
    </article>
  )
}

/** A lesson with a board: a single move to play, a whole line or game to step through, or a static diagram. */
function BoardCard({ motif }: { motif: Motif }) {
  const steps = useMemo(() => (motif.fen && motif.line?.length ? replay(motif.fen, motif.line) : null), [motif])
  const [i, setI] = useState(0)
  const last = steps ? steps.length - 1 : 0
  const cur = steps?.[i]
  const single = last === 1
  const done = i === last && last > 0
  const note = cur?.label ? motif.notes?.find(n => n.at === cur.label) : undefined

  const marks: Record<string, Mark> = !cur || i === 0 ? (motif.marks ?? {}) : (cur.from && cur.to ? { [cur.from]: 'from', [cur.to]: 'to' } : {})
  const arrows = i === 0 ? (motif.arrows ?? []) : []

  return (
    <article className="ln-motif" aria-labelledby={`motif-${motif.id}`}>
      <div className="ln-board">
        <MiniBoard fen={cur?.fen ?? motif.fen!} marks={marks} arrows={arrows}
          label={`${motif.name}: ${i === 0 ? 'start position' : `after ${moveText(cur!.label!, cur!.san!)}`}`} />
      </div>
      <div className="ln-motif-body">
        <h3 id={`motif-${motif.id}`}>{motif.name}</h3>
        {(motif.aka || motif.credit) && <p className="ln-aka">{motif.credit ?? `Also called ${motif.aka}`}</p>}
        <p className="ln-idea">{motif.idea}</p>
        <p className="ln-detail">{motif.detail}</p>

        <div className="ln-status" aria-live="polite">
          {note && <p className="ln-note-line">{note.text}</p>}
          {(done || motif.kind === 'static') && motif.result && <p className="ln-result">{motif.result}</p>}
        </div>

        {steps && single && (
          <button type="button" className="btn-ghost ln-play" aria-pressed={i === 1} onClick={() => setI(i === 1 ? 0 : 1)}>
            {i === 1 ? 'Reset the board' : <>Play <span className="ln-san">{steps[1].san}</span></>}
          </button>
        )}

        {steps && !single && (
          <div className="ln-stepper">
            <div className="ln-stepper-bar" role="group" aria-label={`Step through ${motif.name}`}>
              <button type="button" onClick={() => setI(0)} disabled={i === 0} aria-label="Back to the start">«</button>
              <button type="button" onClick={() => setI(Math.max(0, i - 1))} disabled={i === 0} aria-label="Previous move">‹</button>
              <span className="ln-stepper-now">{i === 0 ? 'Start' : moveText(cur!.label!, cur!.san!)}</span>
              <button type="button" onClick={() => setI(Math.min(last, i + 1))} disabled={i === last} aria-label="Next move">›</button>
              <button type="button" onClick={() => setI(last)} disabled={i === last} aria-label="Jump to the end">»</button>
            </div>
            <p className="ln-stepper-count">{i} of {last} moves</p>
            <details className="ln-moves">
              <summary>All moves</summary>
              <p>
                {steps.slice(1).map((s, k) => (
                  <button key={k} type="button" aria-current={k + 1 === i ? 'step' : undefined} onClick={() => setI(k + 1)}>
                    {s.label!.endsWith('w') ? `${s.label!.slice(0, -1)}.` : ''}{s.san}
                  </button>
                ))}
              </p>
            </details>
          </div>
        )}
      </div>
    </article>
  )
}

function TacticsTab({ onNavigate }: { onNavigate: (m: ModeId) => void }) {
  const [group, setGroup] = useState<MotifGroup>('core')
  const [query, setQuery] = useState('')
  const q = query.trim().toLowerCase()
  const counts = useMemo(() => Object.fromEntries(GROUPS.map(g => [g.id, MOTIFS.filter(m => m.group === g.id).length])), [])
  const shown = q
    ? MOTIFS.filter(m => `${m.name} ${m.aka ?? ''} ${m.idea} ${m.credit ?? ''}`.toLowerCase().includes(q))
    : MOTIFS.filter(m => m.group === group)
  const current = GROUPS.find(g => g.id === group)!

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
        <h2 id="ln-library" className="ln-h">Tactics library <span>{MOTIFS.length} lessons</span></h2>
        <input className="ln-search" type="search" value={query} onChange={e => setQuery(e.target.value)}
          placeholder="Search tactics, mates, traps and games" aria-label="Search tactics, mates, traps and games" />
        {!q && (
          <>
            <div className="ln-chips" role="group" aria-label="Choose a group">
              {GROUPS.map(g => (
                <button key={g.id} type="button" className="ln-chip-btn" aria-pressed={group === g.id} onClick={() => setGroup(g.id)}>
                  {g.label} <span>{counts[g.id]}</span>
                </button>
              ))}
            </div>
            <p className="ln-note">{current.blurb} Play the move or step through the line on each board.</p>
          </>
        )}
        {q && <p className="ln-note">{shown.length} {shown.length === 1 ? 'lesson matches' : 'lessons match'} your search.</p>}
        <div className="ln-motifs">
          {shown.map(m => (m.fen ? <BoardCard key={m.id} motif={m} /> : <ConceptCard key={m.id} motif={m} />))}
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
          {tab === 'strategy' && (
            <ArticleLibrary articles={STRATEGY} onPlaySchool={onPlaySchool} onReadingChange={onReadingChange} backLabel="All guides" noun="strategy guides" />
          )}
          {tab === 'lore' && (
            <ArticleLibrary articles={LORE} onPlaySchool={onPlaySchool} onReadingChange={onReadingChange} backLabel="All lore" noun="lore" />
          )}
        </div>
      </div>
    </HomeFrame>
  )
}
