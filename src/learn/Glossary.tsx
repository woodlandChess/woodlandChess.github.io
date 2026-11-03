import { useMemo, useState } from 'react'
import { GLOSSARY } from './glossary'

/** The glossary: a search box over every term, grouped by first letter. */
export function Glossary() {
  const [query, setQuery] = useState('')
  const q = query.trim().toLowerCase()
  const shown = useMemo(
    () => GLOSSARY.filter(t => !q || t.term.toLowerCase().includes(q) || t.meaning.toLowerCase().includes(q)),
    [q],
  )
  const letters = useMemo(() => Array.from(new Set(shown.map(t => t.term[0].toUpperCase()))), [shown])

  return (
    <div className="ln-glossary">
      <input className="ln-search" type="search" value={query} onChange={e => setQuery(e.target.value)}
        placeholder={`Search ${GLOSSARY.length} terms`} aria-label="Search the glossary" />
      {shown.length === 0 && <p className="ln-empty">No term matches that search.</p>}
      {letters.map(letter => (
        <section key={letter} aria-label={`Terms starting with ${letter}`}>
          <h4 className="ln-letter">{letter}</h4>
          <dl>
            {shown.filter(t => t.term[0].toUpperCase() === letter).map(t => (
              <div key={t.term} className="ln-term">
                <dt>{t.term}</dt>
                <dd>{t.meaning}</dd>
              </div>
            ))}
          </dl>
        </section>
      ))}
    </div>
  )
}
