import { useEffect, useMemo, useRef, useState } from 'react'
import { Chess, type Square } from 'chess.js'
import { ChessBoard, type TrailMove } from '../ChessBoard'
import type { GameReview, Grade, PlyReview, ProfileGame } from './store'

/** Annotation symbols, as printed in chess books. */
const MARK: Record<Grade, string> = { Brilliant: '!!', Great: '!', Best: '', Good: '', Inaccuracy: '?!', Mistake: '?', Blunder: '??' }
/** Moves worth jumping to: your best finds and your costly errors. */
const HIGHLIGHT: Grade[] = ['Brilliant', 'Great', 'Mistake', 'Blunder']
const isError = (p: PlyReview) => p.grade === 'Inaccuracy' || p.grade === 'Mistake' || p.grade === 'Blunder'
const cls = (g: Grade) => `grade-${g.toLowerCase()}`
const label = (p: PlyReview) => `${Math.ceil(p.ply / 2)}${p.color === 'w' ? '.' : '…'} ${p.san}`

/** Keeps the active move inside its own scroller without ever scrolling the page. */
function reveal(box: HTMLElement | null) {
  const active = box?.querySelector<HTMLElement>('[data-active="true"]')
  if (!box || !active) return
  const c = box.getBoundingClientRect(), a = active.getBoundingClientRect()
  if (a.top < c.top + 8) box.scrollTop -= c.top + 8 - a.top
  else if (a.bottom > c.bottom - 8) box.scrollTop += a.bottom - (c.bottom - 8)
}

function EvalGraph({ review, user, ply, onSeek }: { review: GameReview; user: 'w' | 'b'; ply: number; onSeek: (p: number) => void }) {
  const n = review.wins.length - 1
  const mine = (w: number) => (user === 'w' ? w : 100 - w)
  const x = (i: number) => (n ? (i / n) * 100 : 0)
  const y = (w: number) => 40 - (mine(w) / 100) * 40
  const line = review.wins.map((w, i) => `${x(i).toFixed(2)},${y(w).toFixed(2)}`).join(' ')
  const seek = (e: React.PointerEvent<SVGSVGElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    onSeek(Math.max(0, Math.min(n, Math.round(((e.clientX - r.left) / r.width) * n))))
  }
  return (
    <figure className="study-graph">
      <figcaption className="field-label">Your winning chances</figcaption>
      <svg viewBox="0 0 100 40" preserveAspectRatio="none" role="img" aria-label="Winning chances through the game. Tap to jump."
        onPointerDown={e => { e.currentTarget.setPointerCapture(e.pointerId); seek(e) }}
        onPointerMove={e => { if (e.buttons) seek(e) }}>
        <rect className="study-graph-bg" x="0" y="0" width="100" height="40" />
        <polygon className="study-graph-area" points={`0,40 ${line} 100,40`} />
        <line className="study-graph-mid" x1="0" y1="20" x2="100" y2="20" />
        <polyline className="study-graph-line" points={line} />
        {review.plies.filter(p => p.color === user && HIGHLIGHT.includes(p.grade)).map(p => (
          <line key={p.ply} className={`study-graph-tick ${cls(p.grade)}`} x1={x(p.ply)} x2={x(p.ply)} y1="0" y2="40" />
        ))}
        <line className="study-graph-now" x1={x(ply)} x2={x(ply)} y1="0" y2="40" />
      </svg>
    </figure>
  )
}

export function GameStudy({ game, review, onClose }: { game: ProfileGame; review: GameReview; onClose: () => void }) {
  const user = game.userColor
  const plies = review.plies
  const [ply, setPly] = useState(0)
  const [showBest, setShowBest] = useState(false)
  const [tab, setTab] = useState<'review' | 'moves'>('review')
  const movesRef = useRef<HTMLDivElement>(null)
  const dialogRef = useRef<HTMLElement>(null)
  const swipe = useRef<{ x: number; y: number } | null>(null)

  const fens = useMemo(() => {
    const c = new Chess(); const out = [c.fen()]
    for (const p of plies) { c.move(p.san); out.push(c.fen()) }
    return out
  }, [plies])
  const grid = useMemo(() => new Chess(fens[ply]).board(), [fens, ply])
  const current = ply > 0 ? plies[ply - 1] : null
  const highlights = plies.filter(p => p.color === user && HIGHLIGHT.includes(p.grade))
  const mineWin = (k: number) => Math.round(user === 'w' ? review.wins[k] : 100 - review.wins[k])

  // The move just played, plus (on request) the engine's preferred move.
  const trail = useMemo(() => {
    const out: TrailMove[] = []
    if (current) out.push({ from: current.uci.slice(0, 2) as Square, to: current.uci.slice(2, 4) as Square, color: current.color })
    if (showBest && current?.best) {
      try {
        const m = new Chess(fens[ply - 1]).move(current.best)
        out.push({ from: m.from, to: m.to, color: current.color === 'w' ? 'b' : 'w' })
      } catch { /* ignore */ }
    }
    return out
  }, [current, showBest, fens, ply])

  const go = (p: number) => { setShowBest(false); setPly(Math.max(0, Math.min(plies.length, p))) }
  const jump = (dir: 1 | -1) => {
    const list = highlights.map(p => p.ply)
    const target = dir === 1 ? list.find(p => p > ply) : [...list].reverse().find(p => p < ply)
    if (target) go(target)
  }

  useEffect(() => { reveal(movesRef.current) }, [ply, tab])
  useEffect(() => {
    const prevFocus = document.activeElement as HTMLElement | null
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    dialogRef.current?.focus()
    return () => { document.body.style.overflow = prevOverflow; prevFocus?.focus?.() }
  }, [])
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      else if (e.key === 'ArrowRight') go(ply + 1)
      else if (e.key === 'ArrowLeft') go(ply - 1)
      else if (e.key === 'Home') go(0)
      else if (e.key === 'End') go(plies.length)
      else return
      e.preventDefault()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ply, plies.length])

  const opponent = user === 'w' ? game.black : game.white
  const resultWord = { win: 'Won', loss: 'Lost', draw: 'Drew', unknown: 'Played' }[game.result]
  const rows = Math.ceil(plies.length / 2)

  const mover = current ? (current.color === user ? 'You' : 'Opponent') : ''
  const what: Grade | null = current ? current.grade : null
  const costly = current ? isError(current) : false
  const detail = !current ? `${review.opening} · ${resultWord.toLowerCase()} against ${opponent}`
    : current.grade === 'Brilliant' ? 'A brilliant sacrifice: it gives up material and still keeps the best chances.'
    : current.grade === 'Great' ? 'The only move that held up.'
    : current.grade === 'Best' ? 'The engine\'s top choice.'
    : current.grade === 'Good' ? 'A good move.'
    : `Cost ${mover === 'You' ? 'you' : 'them'} ${current.winLoss.toFixed(0)}% winning chances.${current.best ? ` Best was ${current.best}.` : ''}`

  const cell = (p?: PlyReview) => p ? (
    <button type="button" className={`study-move${ply === p.ply ? ' is-current' : ''}`} data-active={ply === p.ply ? 'true' : undefined}
      aria-current={ply === p.ply ? 'step' : undefined} onClick={() => go(p.ply)}>
      {p.san}{MARK[p.grade] && <i className={`study-mark ${cls(p.grade)}`}>{MARK[p.grade]}</i>}
    </button>
  ) : <span />

  return (
    <div className="study-backdrop" onClick={onClose}>
      <section className="study" ref={dialogRef} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="study-title" onClick={e => e.stopPropagation()}>
        <header className="study-bar">
          <div>
            <h2 id="study-title"><span>{review.accuracy}%</span> accuracy</h2>
            <p title={`${resultWord} vs ${opponent} · ${review.opening}`}>{resultWord} vs {opponent} · {review.opening}</p>
          </div>
          <button type="button" className="study-close" onClick={onClose} aria-label="Close study">×</button>
        </header>

        <div className="study-body">
          <div className="study-stage">
            <div className="study-board"
              onPointerDown={e => { swipe.current = { x: e.clientX, y: e.clientY } }}
              onPointerUp={e => {
                const s = swipe.current; swipe.current = null
                if (!s) return
                const dx = e.clientX - s.x, dy = e.clientY - s.y
                if (Math.abs(dx) > 36 && Math.abs(dy) < 30) go(ply + (dx < 0 ? 1 : -1))     // swipe the board to step through the game
              }}>
              <ChessBoard board={grid} orientation={user} interactive={false} selected={null} legalTargets={[]} trail={trail}
                onSquareClick={() => {}} getLegalTargets={() => []} />
            </div>

            <div className="study-now" aria-live="polite">
              <div className="study-now-line">
                <strong>{current ? label(current) : 'Start'}{current && MARK[current.grade] && <i className={`study-mark ${cls(current.grade)}`}>{MARK[current.grade]}</i>}</strong>
                {what && what !== 'Good' && <span className={`study-badge ${cls(what)}`}>{mover === 'Opponent' ? `Opponent · ${what}` : what}</span>}
                <span className="study-chance">You {mineWin(ply)}%</span>
              </div>
              <p>{detail}</p>
              {current?.best && costly && current.color === user && (
                <button type="button" className="study-best" aria-pressed={showBest} onClick={() => setShowBest(v => !v)}>
                  {showBest ? 'Hide best move' : `Show best: ${current.best}`}
                </button>
              )}
            </div>

            <div className="study-controls">
              <button type="button" onClick={() => go(0)} disabled={ply === 0} aria-label="First position">«</button>
              <button type="button" onClick={() => go(ply - 1)} disabled={ply === 0} aria-label="Previous move">‹</button>
              <span>{ply} / {plies.length}</span>
              <button type="button" onClick={() => go(ply + 1)} disabled={ply === plies.length} aria-label="Next move">›</button>
              <button type="button" onClick={() => go(plies.length)} disabled={ply === plies.length} aria-label="Last position">»</button>
            </div>
          </div>

          <div className="study-side">
            <div className="study-tabs" role="tablist" aria-label="Study sections">
              <button type="button" role="tab" id="tab-review" aria-selected={tab === 'review'} aria-controls="panel-review" onClick={() => setTab('review')}>Review</button>
              <button type="button" role="tab" id="tab-moves" aria-selected={tab === 'moves'} aria-controls="panel-moves" onClick={() => setTab('moves')}>Moves</button>
            </div>

            <div className="study-panel" id="panel-review" role="tabpanel" aria-labelledby="tab-review" data-panel="review" hidden={tab !== 'review'}>
              <div className="study-summary">
                <div className="study-stat"><span>You</span><strong>{review.accuracy}%</strong></div>
                <div className="study-stat"><span>{opponent}</span><strong>{review.opponentAccuracy}%</strong></div>
                <div className="study-counts" aria-label="Your move quality">
                  {review.brilliant > 0 && <span className="grade-brilliant"><i>!!</i> Brilliant <b>{review.brilliant}</b></span>}
                  {review.great > 0 && <span className="grade-great"><i>!</i> Great <b>{review.great}</b></span>}
                  <span className="grade-inaccuracy"><i>?!</i> Inaccuracies <b>{review.inaccuracies}</b></span>
                  <span className="grade-mistake"><i>?</i> Mistakes <b>{review.mistakes}</b></span>
                  <span className="grade-blunder"><i>??</i> Blunders <b>{review.blunders}</b></span>
                </div>
              </div>
              {highlights.length > 0 ? (
                <div className="study-moments">
                  <span className="field-label">Key moments</span>
                  <div>
                    {highlights.map(p => (
                      <button key={p.ply} type="button" className={`study-moment ${cls(p.grade)}${ply === p.ply ? ' is-current' : ''}`} onClick={() => go(p.ply)}>
                        {label(p)} <small>{p.grade}</small>
                      </button>
                    ))}
                  </div>
                </div>
              ) : <p className="study-empty">No big errors or standout moves in this game.</p>}
              <EvalGraph review={review} user={user} ply={ply} onSeek={go} />
              <div className="study-jump">
                <button type="button" className="btn-ghost" onClick={() => jump(-1)} disabled={!highlights.some(p => p.ply < ply)}>‹ Previous highlight</button>
                <button type="button" className="btn-ghost" onClick={() => jump(1)} disabled={!highlights.some(p => p.ply > ply)}>Next highlight ›</button>
              </div>
            </div>

            <div className="study-panel" id="panel-moves" role="tabpanel" aria-labelledby="tab-moves" data-panel="moves" hidden={tab !== 'moves'} ref={movesRef}>
              <span className="field-label study-moves-title">Moves</span>
              <ol className="study-moves" aria-label="Move list">
                {Array.from({ length: rows }, (_, i) => (
                  <li key={i}><span className="study-no">{i + 1}.</span>{cell(plies[i * 2])}{cell(plies[i * 2 + 1])}</li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
