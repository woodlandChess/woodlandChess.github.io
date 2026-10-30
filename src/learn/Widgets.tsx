import { useId, useMemo, useState } from 'react'
import { Chess } from 'chess.js'
import { WeightBar } from '../components/Controls'
import { schools, type ChessSchool } from '../stockfish'
import { expectedScore, formatEval, ratingChange, winChance } from './chessMath'

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n))
const sign = (n: number) => (n > 0 ? '+' : n < 0 ? '-' : '')

/** Elo calculator: two ratings in, expected score and rating change out. */
export function EloCalculator() {
  const [you, setYou] = useState(1200)
  const [opp, setOpp] = useState(1400)
  const [k, setK] = useState(20)
  const id = useId()
  const a = clamp(you || 0, 0, 3500)
  const b = clamp(opp || 0, 0, 3500)
  const exp = expectedScore(a, b)
  const rows: [string, number][] = [['Win', 1], ['Draw', 0.5], ['Loss', 0]]

  return (
    <div className="ln-widget" role="group" aria-label="Elo calculator">
      <div className="ln-fields">
        <label htmlFor={`${id}-you`}><span>Your rating</span>
          <input id={`${id}-you`} type="number" inputMode="numeric" min={0} max={3500} step={50} value={you}
            onChange={e => setYou(Number(e.target.value))} />
        </label>
        <label htmlFor={`${id}-opp`}><span>Opponent</span>
          <input id={`${id}-opp`} type="number" inputMode="numeric" min={0} max={3500} step={50} value={opp}
            onChange={e => setOpp(Number(e.target.value))} />
        </label>
        <label htmlFor={`${id}-k`}><span>K-factor</span>
          <select id={`${id}-k`} value={k} onChange={e => setK(Number(e.target.value))}>
            <option value={40}>40 (new player)</option>
            <option value={20}>20 (established)</option>
            <option value={10}>10 (2400 and above)</option>
          </select>
        </label>
      </div>
      <p className="ln-readout" aria-live="polite">
        You are expected to score <strong>{(exp * 100).toFixed(0)}%</strong> of the points.
      </p>
      <div className="ln-bar" role="img" aria-label={`Expected score ${(exp * 100).toFixed(0)} percent`}>
        <i style={{ width: `${exp * 100}%` }} />
      </div>
      <ul className="ln-outcomes">
        {rows.map(([label, score]) => {
          const change = ratingChange(a, b, score, k)
          return (
            <li key={label}>
              <span>{label}</span>
              <strong>{sign(change)}{Math.abs(change).toFixed(1)}</strong>
              <small>{Math.round(a + change)}</small>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

function verdict(cp: number): string {
  const a = Math.abs(cp)
  const side = cp > 0 ? 'White' : 'Black'
  if (a < 30) return 'Equal position'
  if (a < 90) return `${side} is slightly better`
  if (a < 200) return `${side} is clearly better`
  if (a < 400) return `${side} has a winning advantage`
  return `${side} is completely winning`
}

/** An evaluation slider: shows the bar, the number and the rough chance of winning. */
export function EvalMeter() {
  const [cp, setCp] = useState(150)
  const id = useId()
  const white = winChance(cp)
  return (
    <div className="ln-widget" role="group" aria-label="Evaluation explorer">
      <div className="ln-evalbar" role="img" aria-label={`White ${white.toFixed(0)} percent`}>
        <i style={{ height: `${white}%` }} />
      </div>
      <div className="ln-eval-body">
        <label htmlFor={id}><span>Evaluation (pawns)</span></label>
        <input id={id} type="range" min={-1000} max={1000} step={10} value={cp}
          onChange={e => setCp(Number(e.target.value))} aria-valuetext={`${formatEval(cp)}, ${verdict(cp)}`} />
        <p className="ln-readout" aria-live="polite">
          <strong>{formatEval(cp)}</strong> {verdict(cp)}
        </p>
        <p className="ln-subnote">White wins about {white.toFixed(0)}% of such positions in the typical model, Black about {(100 - white).toFixed(0)}%.</p>
      </div>
    </div>
  )
}

/** Opening book of a school as readable moves, for example "1.d4 d5 2.c4 e6". */
export function bookLine(book: string[]): string {
  if (book.length === 0) return 'Adapts to the position'
  const game = new Chess()
  const parts: string[] = []
  book.forEach((pair, i) => {
    const sans: string[] = []
    for (const uci of pair.split(' ')) {
      const m = game.move({ from: uci.slice(0, 2), to: uci.slice(2, 4), promotion: uci[4] })
      sans.push(m.san)
    }
    parts.push(`${i + 1}.${sans.join(' ')}`)
  })
  return parts.join(' ')
}

/** All ten playing schools, each with a button that opens a game against it. */
export function SchoolsGrid({ onPlaySchool }: { onPlaySchool: (s: ChessSchool) => void }) {
  const list = useMemo(() => (Object.entries(schools) as [ChessSchool, (typeof schools)[ChessSchool]][]), [])
  return (
    <ul className="ln-schools">
      {list.map(([id, s]) => (
        <li key={id} className="ln-school">
          <div className="ln-school-head">
            <h4>{s.label}</h4>
            <p>{s.summary}</p>
            <p className="ln-book"><span>Typical opening</span><code>{bookLine(s.book)}</code></p>
          </div>
          <div className="ln-school-bars" aria-label={`${s.label} profile`}>
            <WeightBar label="Attack" value={s.weights.attack} color="var(--w-attack)" />
            <WeightBar label="Focus" value={s.weights.focus} color="var(--w-focus)" />
            <WeightBar label="Defend" value={s.weights.defend} color="var(--w-defend)" />
          </div>
          <button type="button" className="btn-ghost ln-school-go" onClick={() => onPlaySchool(id)}>Play this school</button>
        </li>
      ))}
    </ul>
  )
}
