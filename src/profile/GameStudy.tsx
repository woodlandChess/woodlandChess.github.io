import { useEffect, useMemo, useRef, useState } from 'react'
import { Chess, type Square } from 'chess.js'
import { ChessBoard, type TrailMove } from '../ChessBoard'
import type { GameReview, Grade, ProfileGame, PlyReview } from './store'

const NEEDS_ATTENTION: Grade[] = ['Inaccuracy', 'Mistake', 'Blunder']
const isError = (p: PlyReview) => NEEDS_ATTENTION.includes(p.grade)

/** Keeps the active move inside its own scroller without ever scrolling the page. */
function reveal(box: HTMLElement | null) {
  const active = box?.querySelector<HTMLElement>('[data-active="true"]')
  if (!box || !active) return
  const c = box.getBoundingClientRect(), a = active.getBoundingClientRect()
  box.scrollLeft += a.left - c.left - (c.width - a.width) / 2
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
      <svg viewBox="0 0 100 40" preserveAspectRatio="none" role="img" aria-label="Winning chances through the game"
        onPointerDown={e => { e.currentTarget.setPointerCapture(e.pointerId); seek(e) }}
        onPointerMove={e => { if (e.buttons) seek(e) }}>
        <rect className="study-graph-bg" x="0" y="0" width="100" height="40" />
        <polygon className="study-graph-area" points={`0,40 ${line} 100,40`} />
        <line className="study-graph-mid" x1="0" y1="20" x2="100" y2="20" />
        <polyline className="study-graph-line" points={line} />
        {review.plies.filter(p => p.color === user && (p.grade === 'Mistake' || p.grade === 'Blunder')).map(p => (
          <line key={p.ply} className={`study-graph-tick grade-${p.grade.toLowerCase()}`} x1={x(p.ply)} x2={x(p.ply)} y1="0" y2="40" />
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
  const movesRef = useRef<HTMLOListElement>(null)
  const dialogRef = useRef<HTMLElement>(null)

  const fens = useMemo(() => {
    const c = new Chess(); const out = [c.fen()]
    for (const p of plies) { c.move(p.san); out.push(c.fen()) }
    return out
  }, [plies])
  const grid = useMemo(() => new Chess(fens[ply]).board(), [fens, ply])
  const current = ply > 0 ? plies[ply - 1] : null
  const mineErrors = plies.filter(p => p.color === user && isError(p))
  const keyMoments = [...mineErrors].sort((a, b) => b.winLoss - a.winLoss).slice(0, 4).sort((a, b) => a.ply - b.ply)
  const mineWin = (k: number) => Math.round(user === 'w' ? review.wins[k] : 100 - review.wins[k])

  // Highlight: the move just played, plus (on request) the engine's preferred move instead.
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
  const jumpError = (dir: 1 | -1) => {
    const list = mineErrors.map(p => p.ply)
    const target = dir === 1 ? list.find(p => p > ply) : [...list].reverse().find(p => p < ply)
    if (target) go(target)
  }

  useEffect(() => { reveal(movesRef.current) }, [ply])
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

  const rows = Math.ceil(plies.length / 2)
  const cell = (p?: PlyReview) => p ? (
    <button type="button" className={`study-move${ply === p.ply ? ' is-current' : ''}`} data-active={ply === p.ply ? 'true' : undefined}
      data-grade={p.color === user && isError(p) ? p.grade.toLowerCase() : undefined} aria-current={ply === p.ply ? 'step' : undefined}
      onClick={() => go(p.ply)}>{p.san}</button>
  ) : <span />
  const opponent = user === 'w' ? game.black : game.white
  const resultWord = { win: 'Won', loss: 'Lost', draw: 'Drew', unknown: 'Played' }[game.result]

  const what = !current ? null : current.color !== user ? 'Opponent' : current.grade
  const moveLabel = current ? `${Math.ceil(current.ply / 2)}${current.color === 'w' ? '.' : '…'} ${current.san}` : 'Starting position'
  const detail = !current
    ? `${review.opening} · ${resultWord.toLowerCase()} against ${opponent}`
    : current.best && isError(current) ? `Cost ${current.winLoss.toFixed(0)}% winning chances. Best was ${current.best}.`
    : current.grade === 'Best' ? 'The engine\'s top choice.' : current.grade === 'Good' ? 'A good move.'
    : `Cost ${current.winLoss.toFixed(0)}% winning chances.`

  return (
    <div className="study-backdrop" onClick={onClose}>
      <section className="study" ref={dialogRef} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="study-title" onClick={e => e.stopPropagation()}>
        <header className="study-head">
          <div>
            <span className="setup-kicker">Game study</span>
            <h2 id="study-title">{review.accuracy}% accuracy</h2>
            <p>{resultWord} vs {opponent} · {review.opening} · opponent {review.opponentAccuracy}%</p>
          </div>
          <button type="button" className="study-close" onClick={onClose} aria-label="Close study">×</button>
        </header>

        <div className="study-main">
          <div className="study-board-wrap">
            <div className="study-board">
              <ChessBoard board={grid} orientation={user} interactive={false} selected={null} legalTargets={[]} trail={trail}
                onSquareClick={() => {}} getLegalTargets={() => []} />
            </div>
            <div className="study-now" aria-live="polite">
              <div>
                <strong>{moveLabel}</strong>
                {what && <span className={`study-badge${what === 'Opponent' ? '' : ` grade-${what.toLowerCase()}`}`}>{what}</span>}
              </div>
              <p>{detail}</p>
              <span className="study-chance">You {mineWin(ply)}%</span>
            </div>
            <div className="study-controls">
            <button type="button" onClick={() => go(0)} disabled={ply === 0} aria-label="First position">«</button>
            <button type="button" onClick={() => go(ply - 1)} disabled={ply === 0} aria-label="Previous move">‹</button>
            <span>{ply} / {plies.length}</span>
            <button type="button" onClick={() => go(ply + 1)} disabled={ply === plies.length} aria-label="Next move">›</button>
            <button type="button" onClick={() => go(plies.length)} disabled={ply === plies.length} aria-label="Last position">»</button>
            </div>
          </div>


          <div className="study-info">
            <div className="study-moves-wrap">
              <span className="field-label">Moves</span>
              <ol className="study-moves" ref={movesRef} aria-label="Move list">
                {Array.from({ length: rows }, (_, i) => (
                  <li key={i}><span className="study-no">{i + 1}.</span>{cell(plies[i * 2])}{cell(plies[i * 2 + 1])}</li>
                ))}
              </ol>
            </div>
            <div className="study-jump">
              <button type="button" className="btn-ghost" onClick={() => jumpError(-1)} disabled={!mineErrors.some(p => p.ply < ply)}>‹ Previous error</button>
              <button type="button" className="btn-ghost" onClick={() => jumpError(1)} disabled={!mineErrors.some(p => p.ply > ply)}>Next error ›</button>
            </div>
            {current?.best && isError(current) && current.color === user && (
              <button type="button" className="btn-ghost study-best" aria-pressed={showBest} onClick={() => setShowBest(v => !v)}>
                {showBest ? 'Hide best move' : `Show best move (${current.best})`}
              </button>
            )}
            <EvalGraph review={review} user={user} ply={ply} onSeek={go} />
            <div className="study-chips" aria-label="Your move quality">
              <span className="grade-blunder">Blunders <b>{review.blunders}</b></span>
              <span className="grade-mistake">Mistakes <b>{review.mistakes}</b></span>
              <span className="grade-inaccuracy">Inaccuracies <b>{review.inaccuracies}</b></span>
            </div>
            {keyMoments.length > 0 && (
              <div className="study-moments">
                <span className="field-label">Key moments</span>
                <div>
                  {keyMoments.map(p => (
                    <button key={p.ply} type="button" className={`study-moment grade-${p.grade.toLowerCase()}`} onClick={() => go(p.ply)}>
                      {Math.ceil(p.ply / 2)}{p.color === 'w' ? '.' : '…'} {p.san} <small>{p.grade}</small>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
