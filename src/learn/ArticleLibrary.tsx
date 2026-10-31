import { useEffect, useMemo, useRef, useState } from 'react'
import type { ChessSchool } from '../stockfish'
import type { Article, Block } from './lore'
import { readingMinutes } from './lore'
import { MiniBoard } from './MiniBoard'
import { EloCalculator, EvalMeter, SchoolsGrid } from './Widgets'

function Blocks({ blocks, onPlaySchool }: { blocks: Block[]; onPlaySchool: (s: ChessSchool) => void }) {
  return (
    <>
      {blocks.map((b, i) => {
        switch (b.t) {
          case 'p': return <p key={i} className="ln-p">{b.text}</p>
          case 'h': return <h3 key={i} className="ln-h3">{b.text}</h3>
          case 'ul': return <ul key={i} className="ln-ul">{b.items.map(t => <li key={t}>{t}</li>)}</ul>
          case 'note': return <p key={i} className="ln-callout">{b.text}</p>
          case 'board': return (
            <figure key={i} className="ln-fig">
              <MiniBoard fen={b.fen} marks={b.marks} arrows={b.arrows} label={b.caption} />
              <figcaption>{b.caption}</figcaption>
            </figure>
          )
          case 'table': return (
            <div key={i} className="ln-table-wrap">
              <table className={`ln-table${b.head.length === 2 ? ' ln-table--pair' : ''}`}>
                <thead><tr>{b.head.map(h => <th key={h} scope="col">{h}</th>)}</tr></thead>
                <tbody>{b.rows.map((r, ri) => (
                  <tr key={ri}>{r.map((c, ci) => ci === 0 ? <th key={ci} scope="row">{c}</th> : <td key={ci} data-label={b.head[ci]}>{c}</td>)}</tr>
                ))}</tbody>
              </table>
            </div>
          )
          case 'widget':
            if (b.id === 'elo') return <EloCalculator key={i} />
            if (b.id === 'eval') return <EvalMeter key={i} />
            return <SchoolsGrid key={i} onPlaySchool={onPlaySchool} />
        }
      })}
    </>
  )
}

export interface ArticleLibraryProps {
  articles: Article[]
  onPlaySchool: (s: ChessSchool) => void
  /** Tells the page whether an article is open, so it can swap the tabs for the article bar. */
  onReadingChange?: (reading: boolean) => void
  /** Text of the back button, for example "All lore". */
  backLabel: string
  /** What the search box looks for, for example "lore". */
  noun: string
}

/** A searchable list of articles; opening one shows it in place with a pinned back button. */
export function ArticleLibrary({ articles, onPlaySchool, onReadingChange, backLabel, noun }: ArticleLibraryProps) {
  const [openId, setOpenId] = useState<string | null>(null)
  const [topic, setTopic] = useState('All')
  const [query, setQuery] = useState('')
  const top = useRef<HTMLElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const savedScroll = useRef(0)
  const article = articles.find(a => a.id === openId)

  const topics = useMemo(() => ['All', ...Array.from(new Set(articles.map(a => a.topic)))], [articles])
  const shown = useMemo(() => {
    const q = query.trim().toLowerCase()
    return articles.filter(a => (topic === 'All' || a.topic === topic) &&
      (!q || `${a.title} ${a.summary} ${a.topic}`.toLowerCase().includes(q)))
  }, [articles, topic, query])

  const scroller = () => (top.current ?? listRef.current)?.closest<HTMLElement>('.setup-shell') ?? null
  const open = (id: string) => { savedScroll.current = scroller()?.scrollTop ?? 0; setOpenId(id) }
  const close = () => setOpenId(null)

  useEffect(() => { onReadingChange?.(openId !== null); return () => onReadingChange?.(false) }, [openId, onReadingChange])

  // Returning to the list puts you back where you were.
  const wasOpen = useRef(false)
  useEffect(() => {
    if (!openId && wasOpen.current) requestAnimationFrame(() => { const s = scroller(); if (s) s.scrollTop = savedScroll.current })
    wasOpen.current = openId !== null
  }, [openId])

  // Open at the top, and let Escape close the article.
  useEffect(() => {
    if (!openId) return
    const sc = scroller()
    if (sc) sc.scrollTop = 0
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [openId])

  if (article) {
    return (
      <article className="ln-article" ref={top} aria-labelledby="article-title">
        <div className="ln-stick ln-articlebar">
          <button type="button" className="ln-back" onClick={close}>
            <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M13 8H4M7.5 4l-4 4 4 4" /></svg>
            {backLabel}
          </button>
          <span className="ln-bartitle">{article.title}</span>
        </div>
        <p className="ln-kicker">{article.topic} · {readingMinutes(article)} min read</p>
        <h2 id="article-title" className="ln-title">{article.title}</h2>
        <p className="ln-lede">{article.summary}</p>
        <Blocks blocks={article.blocks} onPlaySchool={onPlaySchool} />
      </article>
    )
  }

  return (
    <div className="ln-library" ref={listRef}>
      <input className="ln-search" type="search" value={query} onChange={e => setQuery(e.target.value)}
        placeholder={`Search ${noun}`} aria-label={`Search ${noun}`} />
      {topics.length > 2 && (
        <div className="ln-chips" role="group" aria-label="Filter by topic">
          {topics.map(t => (
            <button key={t} type="button" className="ln-chip-btn" aria-pressed={topic === t} onClick={() => setTopic(t)}>{t}</button>
          ))}
        </div>
      )}
      {shown.length === 0 ? (
        <p className="ln-empty">Nothing matches that search.</p>
      ) : (
        <ul className="ln-lore">
          {shown.map(a => (
            <li key={a.id}>
              <button type="button" className="ln-lore-card" onClick={() => open(a.id)}>
                <span className="ln-kicker">{a.topic} · {readingMinutes(a)} min read</span>
                <span className="ln-lore-title">{a.title}</span>
                <span className="ln-lore-sum">{a.summary}</span>
                <svg className="ln-lore-arrow" viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8h9M8.5 4l4 4-4 4" /></svg>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
