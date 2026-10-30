import { useMemo, useState } from 'react'
import { Chess } from 'chess.js'
import { HomeFrame } from '../components/HomeFrame'
import { WeightBar } from '../components/Controls'
import { IconCalendar, IconPuzzle } from '../components/ModeIcons'
import { pathForMode, type ModeId } from '../routes'
import { schools, type ChessSchool } from '../stockfish'
import { MiniBoard, type Mark } from './MiniBoard'
import { MOTIFS, type Motif } from './motifs'
import '../styles/learn.css'

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

export function LearnPage({ onNavigate, onPlaySchool }: {
  onNavigate: (m: ModeId) => void
  onPlaySchool: (school: ChessSchool) => void
}) {
  const list = Object.entries(schools) as [ChessSchool, (typeof schools)[ChessSchool]][]
  return (
    <HomeFrame
      mode="learn"
      onNavigate={onNavigate}
      titleId="learn-title"
      kicker="Learn"
      title={<>Study the <em>board</em></>}
      copy="Train tactics against real positions, learn the patterns behind them, and meet the ten schools you can play against."
    >
      <div className="ln">
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

        <section className="ln-sec" aria-labelledby="ln-motifs">
          <h2 id="ln-motifs" className="ln-h">Tactic motifs</h2>
          <p className="ln-note">Six patterns that decide most games. Play the move on each diagram to see what it does.</p>
          <div className="ln-motifs">
            {MOTIFS.map(m => <MotifCard key={m.id} motif={m} />)}
          </div>
        </section>

        <section className="ln-sec" aria-labelledby="ln-schools">
          <h2 id="ln-schools" className="ln-h">Playing schools</h2>
          <p className="ln-note">Each school shapes the computer's openings and temperament. Pick one to start a game against it.</p>
          <ul className="ln-schools">
            {list.map(([id, s]) => (
              <li key={id} className="ln-school">
                <div className="ln-school-head">
                  <h3>{s.label}</h3>
                  <p>{s.summary}</p>
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
        </section>
      </div>
    </HomeFrame>
  )
}
