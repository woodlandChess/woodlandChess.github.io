import { useEffect, useRef, useState } from 'react'
import type { ChessSchool } from '../stockfish'
import { LORE, readingMinutes, type Article, type Block } from './lore'
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
          case 'table': return (
            <div key={i} className="ln-table-wrap" tabIndex={0} role="region" aria-label="Table, scrolls sideways on small screens">
              <table className="ln-table">
                <thead><tr>{b.head.map(h => <th key={h} scope="col">{h}</th>)}</tr></thead>
                <tbody>{b.rows.map((r, ri) => (
                  <tr key={ri}>{r.map((c, ci) => ci === 0 ? <th key={ci} scope="row">{c}</th> : <td key={ci}>{c}</td>)}</tr>
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

/** List of articles; opening one shows it in place with a back button. */
export function LoreTab({ onPlaySchool }: { onPlaySchool: (s: ChessSchool) => void }) {
  const [openId, setOpenId] = useState<string | null>(null)
  const top = useRef<HTMLDivElement>(null)
  const article: Article | undefined = LORE.find(a => a.id === openId)

  // Bring the start of the article into view, and let Escape close it.
  useEffect(() => {
    if (!openId) return
    top.current?.scrollIntoView({ block: 'start' })
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpenId(null) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [openId])

  if (article) {
    return (
      <article className="ln-article" ref={top} aria-labelledby="lore-title">
        <button type="button" className="ln-back" onClick={() => setOpenId(null)}>
          <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M13 8H4M7.5 4l-4 4 4 4" /></svg>
          All lore
        </button>
        <p className="ln-kicker">{article.topic} · {readingMinutes(article)} min read</p>
        <h2 id="lore-title" className="ln-title">{article.title}</h2>
        <p className="ln-lede">{article.summary}</p>
        <Blocks blocks={article.blocks} onPlaySchool={onPlaySchool} />
      </article>
    )
  }

  return (
    <ul className="ln-lore">
      {LORE.map(a => (
        <li key={a.id}>
          <button type="button" className="ln-lore-card" onClick={() => setOpenId(a.id)}>
            <span className="ln-kicker">{a.topic} · {readingMinutes(a)} min read</span>
            <span className="ln-lore-title">{a.title}</span>
            <span className="ln-lore-sum">{a.summary}</span>
            <svg className="ln-lore-arrow" viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8h9M8.5 4l4 4-4 4" /></svg>
          </button>
        </li>
      ))}
    </ul>
  )
}
