import { FEATURED_GUIDE, GUIDES } from './strategy'
import { MiniBoard } from './MiniBoard'

/** Mock-up of the Strategy section: one worked preview and an outline of what is coming. */
export function StrategyTab() {
  const featured = GUIDES.find(g => g.id === FEATURED_GUIDE.id)!
  const rest = GUIDES.filter(g => g.id !== featured.id)
  return (
    <div className="ln-strategy">
      <p className="ln-note">
        Strategy guides are on the way. This is a preview of the section: the first guide shows the layout, and the rest are the topics we will write next.
      </p>

      <article className="ln-featured" aria-labelledby="guide-featured">
        <MiniBoard fen={FEATURED_GUIDE.fen} marks={FEATURED_GUIDE.marks}
          label="Starting position after 1.e4 e5, with the four central squares marked" />
        <div className="ln-featured-body">
          <p className="ln-kicker">Preview · {featured.level}</p>
          <h3 id="guide-featured" className="ln-title ln-title--sm">{featured.title}</h3>
          <p className="ln-detail">{featured.blurb}</p>
          <ol className="ln-outline">
            {FEATURED_GUIDE.outline.map(line => <li key={line}>{line}</li>)}
          </ol>
          <span className="ln-chip ln-chip--soon">Full guide coming soon</span>
        </div>
      </article>

      <ul className="ln-guides">
        {rest.map(g => (
          <li key={g.id} className="ln-guide">
            <span className="ln-kicker">{g.level}</span>
            <h4>{g.title}</h4>
            <p>{g.blurb}</p>
            <span className="ln-chip ln-chip--soon">Coming soon</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
