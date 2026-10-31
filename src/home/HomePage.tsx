import { useEffect, useRef, useState, useSyncExternalStore, type CSSProperties, type ElementType, type MouseEvent, type PointerEvent, type ReactNode } from 'react'
import { BrandMark } from '../components/BrandMark'
import { IconAnalyze, IconComputer, IconLearn, IconOnline, IconVolume } from '../components/ModeIcons'
import { ModeNav } from '../components/ModeNav'
import { MiniBoard } from '../learn/MiniBoard'
import { MOTIFS } from '../learn/motifs'
import { pathForMode, type ModeId } from '../routes'
import { sound } from '../sound'
import { schools, type ChessSchool } from '../stockfish'
import { HeroArt } from './HeroArt'
import '../styles/home.css'

export interface HomePageProps {
  onNavigate: (mode: ModeId) => void
  /** Open the computer setup with this playing school already chosen. */
  onPlaySchool: (school: ChessSchool) => void
  /** A computer game is under way: the primary button resumes it. */
  resume?: { moves: number } | null
}

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

// ── small hooks ───────────────────────────────────────────────────────────────

/** True once the element has entered the viewport (immediately when motion is reduced). */
function useInView<T extends HTMLElement>(threshold = 0.2) {
  const ref = useRef<T>(null)
  const [seen, setSeen] = useState(() => prefersReducedMotion() || typeof IntersectionObserver !== 'function')
  useEffect(() => {
    const el = ref.current
    if (!el || seen) return
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setSeen(true); io.disconnect() } },
      { threshold, rootMargin: '0px 0px -6% 0px' })
    io.observe(el)
    return () => io.disconnect()
  }, [seen, threshold])
  return [ref, seen] as const
}

/** Fade, rise and un-blur once, as the block scrolls in. Slow and critically damped. */
function Reveal({ as: Tag = 'div', delay = 0, className = '', children, ...rest }: {
  as?: ElementType; delay?: number; className?: string; children: ReactNode; id?: string; 'aria-labelledby'?: string
}) {
  const [ref, seen] = useInView<HTMLElement>(0.12)
  return (
    <Tag ref={ref} className={`rv ${className}`} data-in={seen ? '' : undefined}
      style={{ '--rv-delay': `${delay}ms` } as CSSProperties} {...rest}>
      {children}
    </Tag>
  )
}

function useCountUp(target: number, run: boolean, ms = 1400) {
  const [n, setN] = useState(() => (prefersReducedMotion() ? target : 0))
  useEffect(() => {
    if (!run || prefersReducedMotion()) { if (run) setN(target); return }
    let raf = 0
    const t0 = performance.now()
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / ms)
      setN(Math.round(target * (1 - Math.pow(1 - p, 3))))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [run, target, ms])
  return n
}

// ── pieces of the page ────────────────────────────────────────────────────────

function SoundButton() {
  const on = useSyncExternalStore(sound.subscribe, sound.isEnabled, () => true)
  return (
    <button type="button" className="hm-icon-btn" aria-pressed={!on}
      aria-label={on ? 'Mute sounds' : 'Turn sounds on'} title={on ? 'Mute sounds' : 'Turn sounds on'}
      onClick={() => { void sound.unlock(); sound.setEnabled(!on) }}>
      <IconVolume muted={!on} />
    </button>
  )
}

const ways: { id: Exclude<ModeId, 'home' | 'puzzle'>; no: string; title: string; copy: string; meta: string; Icon: typeof IconComputer }[] = [
  { id: 'ai',      no: '01', title: 'Computer', copy: 'Face Stockfish 18 across ten playing schools and three strengths.', meta: 'On your device', Icon: IconComputer },
  { id: 'online',  no: '02', title: 'Multiplayer', copy: 'Seek real opponents through your Lichess account.',                  meta: 'Lichess',        Icon: IconOnline },
  { id: 'profile', no: '03', title: 'Analyze',  copy: 'Review your games move by move and see how your style reads.',       meta: 'Private',        Icon: IconAnalyze },
  { id: 'learn',   no: '04', title: 'Learn',    copy: 'Puzzles, tactics and mates, strategy guides and the story of chess.', meta: 'Tactics · Strategy · Lore', Icon: IconLearn },
]

/** A link that behaves like a button inside the SPA but stays a real anchor. */
function useGo(onNavigate: (m: ModeId) => void) {
  return (mode: ModeId) => (e: MouseEvent<HTMLElement>) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
    e.preventDefault()
    onNavigate(mode)
  }
}

function spotlight(e: PointerEvent<HTMLElement>) {
  const r = e.currentTarget.getBoundingClientRect()
  e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`)
  e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`)
}

function Stat({ value, label, run, suffix = '' }: { value: number; label: string; run: boolean; suffix?: string }) {
  const n = useCountUp(value, run)
  return (
    <li className="hm-stat">
      <span className="hm-stat-n" aria-label={`${value}${suffix}`}><span aria-hidden="true">{n}{suffix}</span></span>
      <span className="hm-stat-l">{label}</span>
    </li>
  )
}

export function HomePage({ onNavigate, onPlaySchool, resume }: HomePageProps) {
  const go = useGo(onNavigate)
  const scroller = useRef<HTMLElement>(null)
  const reel = useRef<HTMLUListElement>(null)
  const [statsRef, statsSeen] = useInView<HTMLUListElement>(0.5)
  const schoolList = Object.entries(schools) as [ChessSchool, (typeof schools)[ChessSchool]][]
  const teaser = MOTIFS.find(m => m.id === 'back-rank')!

  const scrollReel = (dir: 1 | -1) => {
    const el = reel.current
    if (!el) return
    el.scrollBy({ left: dir * Math.max(240, el.clientWidth * 0.8), behavior: prefersReducedMotion() ? 'auto' : 'smooth' })
  }

  return (
    <main className="home" ref={scroller}>
      {/* ── hero ─────────────────────────────────────────────────────────── */}
      <section className="hm-hero" aria-labelledby="hm-title">
        <div className="hm-art" aria-hidden="true"><HeroArt /></div>

        <header className="hm-top">
          <a className="brand" href={pathForMode('home', import.meta.env.BASE_URL)} aria-label="Woodland Chess, back to top"
            onClick={e => { e.preventDefault(); scroller.current?.scrollTo({ top: 0, behavior: prefersReducedMotion() ? 'auto' : 'smooth' }) }}>
            <BrandMark />
            <span className="brand-name">Woodland Chess</span>
          </a>
          <SoundButton />
        </header>

        <div className="hm-copy">
          <p className="hm-kicker hm-in" style={{ '--d': '0.15s' } as CSSProperties}>
            <i aria-hidden="true" />Woodland · Vol. 001
          </p>
          <h1 id="hm-title" className="hm-title">
            <span className="hm-in" style={{ '--d': '0.3s' } as CSSProperties}>Play with</span>
            <em className="hm-in" style={{ '--d': '0.5s' } as CSSProperties}>intent.</em>
          </h1>
          <p className="hm-lede hm-in" style={{ '--d': '0.75s' } as CSSProperties}>
            Stockfish on your device, real opponents on Lichess, rated tactics and a review of your own games. One quiet, dark board.
          </p>
          <div className="hm-cta hm-in" style={{ '--d': '0.95s' } as CSSProperties}>
            <a className="hm-btn hm-btn--primary" href={pathForMode('ai', import.meta.env.BASE_URL)} onClick={go('ai')}>
              <span>{resume ? 'Resume game' : 'Play the computer'}</span>
              {resume && <small>Move {Math.ceil(resume.moves / 2)}</small>}
              <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8h9M8.5 4l4 4-4 4" /></svg>
            </a>
            <a className="hm-btn" href={pathForMode('online', import.meta.env.BASE_URL)} onClick={go('online')}>Play online</a>
          </div>
          <a className="hm-scroll hm-in" style={{ '--d': '1.3s' } as CSSProperties} href="#hm-ways"
            onClick={e => { e.preventDefault(); document.getElementById('hm-ways')?.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' }) }}>
            <span>Explore</span><i aria-hidden="true" />
          </a>
        </div>
      </section>

      {/* ── four ways in ─────────────────────────────────────────────────── */}
      <Reveal as="section" id="hm-ways" className="hm-section" aria-labelledby="hm-ways-t">
        <div className="hm-head">
          <span className="hm-eyebrow">The board, four ways</span>
          <h2 id="hm-ways-t">Choose how you <em>sit down</em></h2>
        </div>
        <ul className="hm-ways">
          {ways.map(({ id, no, title, copy, meta, Icon }, i) => (
            <Reveal as="li" key={id} delay={i * 90}>
              <a className="hm-way" href={pathForMode(id, import.meta.env.BASE_URL)} onClick={go(id)} onPointerMove={spotlight}>
                <span className="hm-way-no">{no}</span>
                <Icon className="hm-way-icon" />
                <span className="hm-way-title">{title}</span>
                <span className="hm-way-copy">{copy}</span>
                <span className="hm-way-foot">
                  <span>{meta}</span>
                  <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 3h10v10h-2V6.4L3.7 13.7 2.3 12.3 9.6 5H3V3z" /></svg>
                </span>
              </a>
            </Reveal>
          ))}
        </ul>
      </Reveal>

      {/* ── numbers ──────────────────────────────────────────────────────── */}
      <section className="hm-band" aria-label="At a glance">
        <ul className="hm-stats" ref={statsRef}>
          <Stat value={schoolList.length} label="Playing schools" run={statsSeen} />
          <Stat value={3} label="Strength tiers" run={statsSeen} />
          <Stat value={MOTIFS.length} label="Tactic lessons" run={statsSeen} />
          <Stat value={18} label="Stockfish version" run={statsSeen} />
        </ul>
      </section>

      {/* ── schools ──────────────────────────────────────────────────────── */}
      <Reveal as="section" className="hm-section" aria-labelledby="hm-schools-t">
        <div className="hm-head hm-head--row">
          <div>
            <span className="hm-eyebrow">Playing schools</span>
            <h2 id="hm-schools-t">Ten schools, ten <em>temperaments</em></h2>
          </div>
          <div className="hm-reel-ctl" aria-hidden="false">
            <button type="button" className="hm-icon-btn" aria-label="Previous schools" onClick={() => scrollReel(-1)}>
              <svg viewBox="0 0 16 16"><path d="M10 3 5 8l5 5" /></svg>
            </button>
            <button type="button" className="hm-icon-btn" aria-label="Next schools" onClick={() => scrollReel(1)}>
              <svg viewBox="0 0 16 16"><path d="m6 3 5 5-5 5" /></svg>
            </button>
          </div>
        </div>
        <ul className="hm-reel" ref={reel} aria-label="Playing schools">
          {schoolList.map(([id, s]) => (
            <li key={id} className="hm-school">
              <button type="button" onClick={() => onPlaySchool(id)} onPointerMove={spotlight}>
                <span className="hm-school-name">{s.label}</span>
                <span className="hm-school-copy">{s.summary}</span>
                <span className="hm-meters">
                  {([['Attack', s.weights.attack], ['Focus', s.weights.focus], ['Defend', s.weights.defend]] as const).map(([l, v]) => (
                    <span key={l} className="hm-meter">
                      <span>{l}</span>
                      <i style={{ '--v': v / 10 } as CSSProperties} />
                      <b>{v}</b>
                    </span>
                  ))}
                </span>
                <span className="hm-school-go">Play this school<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8h9M8.5 4l4 4-4 4" /></svg></span>
              </button>
            </li>
          ))}
        </ul>
      </Reveal>

      {/* ── puzzle teaser ────────────────────────────────────────────────── */}
      <Reveal as="section" className="hm-section hm-puzzle" aria-labelledby="hm-puzzle-t">
        <div className="hm-puzzle-board">
          <MiniBoard fen={teaser.fen!} marks={{ g8: 'target' }} arrows={[['a1', 'a8']]} label="White to move: rook on a1, black king on g8 behind its pawns" />
        </div>
        <div className="hm-puzzle-copy">
          <span className="hm-eyebrow">Tactics</span>
          <h2 id="hm-puzzle-t">White to move. <em>Mate in one.</em></h2>
          <p>A single position, a forced line, no room to improvise. Solve rated puzzles from the Lichess database or take the daily challenge.</p>
          <div className="hm-cta">
            <a className="hm-btn hm-btn--primary" href={pathForMode('puzzle', import.meta.env.BASE_URL)} onClick={go('puzzle')}>
              <span>Solve puzzles</span>
              <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8h9M8.5 4l4 4-4 4" /></svg>
            </a>
            <a className="hm-btn" href={pathForMode('learn', import.meta.env.BASE_URL)} onClick={go('learn')}>Tactic motifs</a>
          </div>
        </div>
      </Reveal>

      {/* ── colophon ─────────────────────────────────────────────────────── */}
      <footer className="hm-foot">
        <span className="hm-rule" aria-hidden="true" />
        <p className="hm-sign">A <a href="https://hassanireza.github.io/" target="_blank" rel="noopener noreferrer">hassanireza</a> product</p>
        <p className="hm-credits">Engine Stockfish 18 · Online play and puzzles by Lichess · Pieces by cburnett (CC BY-SA 3.0)</p>
      </footer>

      <ModeNav current="home" onSelect={onNavigate} />
    </main>
  )
}
