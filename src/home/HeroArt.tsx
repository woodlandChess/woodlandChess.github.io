/**
 * Home hero artwork: a monumental knight lit by a single light, standing on a
 * perspective board at the edge of a hairline forest, inside a slowly turning
 * halo. Everything is vector and CSS-animated (no canvas, no filters), in the
 * Abyssal Liturgy palette: void, slate, bone and oxidized silver only.
 *
 * Rules the animation follows (hassanireza brand, "motion is a whisper"):
 *  - slow, critically damped easing; nothing bounces
 *  - one light source (top right); every highlight and rim agrees with it
 *  - the resting state of every element is its final state, so reduced motion
 *    (and a browser without CSS animation) shows a finished, still picture
 *
 * The knight silhouette is the cburnett knight already used for the brand mark
 * (CC BY-SA 3.0).
 */
import { useEffect, useMemo, useRef } from 'react'
import '../styles/hero.css'

// ── deterministic randomness: the art is identical on every load ───────────
function rng(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
const f = (n: number) => Math.round(n * 10) / 10

// ── board in perspective ───────────────────────────────────────────────────
const BX = 360, Y0 = 470, Y1 = 694, W0 = 150, W1 = 372
const depth = (r: number) => Math.pow(r / 8, 1.22)
/** Cell coordinate (col 0..8, row 0..8, row 0 = far edge) to screen point. */
function bp(c: number, r: number): [number, number] {
  const d = depth(r)
  const half = W0 + (W1 - W0) * d
  return [f(BX + (c / 8 - 0.5) * 2 * half), f(Y0 + (Y1 - Y0) * d)]
}
const quad = (c: number, r: number) =>
  [bp(c, r), bp(c + 1, r), bp(c + 1, r + 1), bp(c, r + 1)].map(p => p.join(',')).join(' ')

// Knight geometry (grid 0..45, from the brand mark)
const KNIGHT_BODY = 'M22 10C32.5 11 38.5 18 38 39L15 39C15 30 25 32.5 23 18'
const KNIGHT_HEAD = 'M24 18C24.38 20.91 18.45 25.37 16 27C13 29 13.18 31.34 11 31C9.958 30.06 12.41 27.96 11 28C10 28 11.19 29.23 10 30C9 30 5.997 31 6 26C6 24 12 14 12 14C12 14 13.89 12.1 14 10.5C13.27 9.506 13.5 8.5 13.5 7.5C14.5 6.5 16.5 10 16.5 10L18.5 10C18.5 10 19.28 8.008 21 7C22 7 22 10 22 10'

// The knight's move drawn on the board: b2 to c4 (one file across, two ranks up).
const MOVE_FROM = bp(1.5, 6.5)
const MOVE_MID = bp(1.5, 4.5)
const MOVE_TO = bp(2.5, 4.5)
const MOVE_D = `M${MOVE_FROM.join(' ')} L${MOVE_MID.join(' ')} L${MOVE_TO.join(' ')}`

/** A hairline pine: trunk plus three stacked chevrons. */
function pine(x: number, base: number, h: number, w: number) {
  const top = base - h
  let d = `M${f(x)} ${f(base)}V${f(top)}`
  for (let k = 0; k < 3; k++) {
    const y = top + h * (0.24 + 0.24 * k)
    const hw = w * (0.5 + 0.28 * k)
    d += `M${f(x - hw)} ${f(y + hw * 0.85)}L${f(x)} ${f(y)}L${f(x + hw)} ${f(y + hw * 0.85)}`
  }
  return d
}

export function HeroArt({ className = '' }: { className?: string }) {
  const root = useRef<SVGSVGElement>(null)

  // Park every loop while the hero is scrolled out of view or the tab is hidden.
  useEffect(() => {
    const el = root.current
    if (!el) return
    let visible = true
    const apply = () => el.classList.toggle('is-paused', !visible || document.hidden)
    const io = typeof IntersectionObserver === 'function'
      ? new IntersectionObserver(([e]) => { visible = e.isIntersecting; apply() }, { threshold: 0 })
      : null
    io?.observe(el)
    document.addEventListener('visibilitychange', apply)
    return () => { io?.disconnect(); document.removeEventListener('visibilitychange', apply) }
  }, [])

  const art = useMemo(() => {
    const r = rng(20261030)

    const squares: { d: string; light: boolean; delay: number; key: string }[] = []
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        squares.push({
          key: `${col}-${row}`,
          d: quad(col, row),
          light: (col + row) % 2 === 0,
          delay: f(0.25 + Math.hypot(col - 4.2, row - 2.2) * 0.075),
        })
      }
    }

    // Distant tree line: three swaying groups of fine trunks.
    const trunks: { x: number; h: number; o: number; g: number }[] = []
    for (let i = 0; i < 70; i++) {
      const x = (i / 69) * 760 - 20 + (r() - 0.5) * 8
      const ridge = 0.5 + 0.5 * Math.sin(x * 0.011 + 1.3) * Math.cos(x * 0.0043)
      trunks.push({ x: f(x), h: f(46 + ridge * 96 + r() * 54), o: f(0.1 + r() * 0.18), g: i % 3 })
    }

    // Nearer pines, left and right, framing the board.
    const pinesBack: string[] = []
    const pinesFront: string[] = []
    const xs = [24, 74, 128, 196, 560, 612, 668, 712]
    xs.forEach((x, i) => {
      const h = 120 + r() * 90
      const w = 22 + r() * 12
      pinesBack.push(pine(x + (r() - 0.5) * 18, Y0 + 6, h * 0.7, w * 0.8))
      if (i % 2 === 0) pinesFront.push(pine(x + 18, Y0 + 26, h, w))
    })

    // Dust in the light: drifts up and toward the light.
    const motes = Array.from({ length: 24 }, (_, i) => ({
      key: i,
      x: f(150 + r() * 520),
      y: f(180 + r() * 430),
      r: f(0.7 + r() * 1.5),
      dx: Math.round(10 + r() * 34),
      dy: -Math.round(60 + r() * 120),
      dur: f(9 + r() * 9),
      delay: -f(r() * 14),
      o: f(0.35 + r() * 0.5),
    }))

    return { squares, trunks, pinesBack, pinesFront, motes }
  }, [])

  return (
    <svg ref={root} className={`hv ${className}`} viewBox="0 0 720 700" preserveAspectRatio="xMidYMid slice"
      aria-hidden="true" focusable="false">
      <defs>
        <radialGradient id="hv-light" cx="560" cy="110" r="470" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#c9cfd2" stopOpacity="0.2" />
          <stop offset="0.35" stopColor="#7c8891" stopOpacity="0.09" />
          <stop offset="1" stopColor="#08090b" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="hv-stage" cx="430" cy="400" r="250" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#12161a" stopOpacity="0.95" />
          <stop offset="0.7" stopColor="#0d1013" stopOpacity="0.5" />
          <stop offset="1" stopColor="#0d1013" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="hv-shadow-g">
          <stop offset="0" stopColor="#000" stopOpacity="0.8" />
          <stop offset="0.6" stopColor="#000" stopOpacity="0.35" />
          <stop offset="1" stopColor="#000" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="hv-body" x1="0.15" y1="0.05" x2="0.8" y2="1">
          <stop offset="0" stopColor="#2b343c" />
          <stop offset="0.55" stopColor="#151a1f" />
          <stop offset="1" stopColor="#0b0d10" />
        </linearGradient>
        <linearGradient id="hv-rim" x1="0.95" y1="0" x2="0.05" y2="0.85">
          <stop offset="0" stopColor="#e6e3da" stopOpacity="0.95" />
          <stop offset="0.45" stopColor="#9aa3a8" stopOpacity="0.4" />
          <stop offset="1" stopColor="#7c8891" stopOpacity="0.1" />
        </linearGradient>
        <linearGradient id="hv-spec" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#e6e3da" stopOpacity="0" />
          <stop offset="0.5" stopColor="#e6e3da" stopOpacity="0.34" />
          <stop offset="1" stopColor="#e6e3da" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="hv-trunk" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#9aa3a8" stopOpacity="0" />
          <stop offset="1" stopColor="#9aa3a8" stopOpacity="1" />
        </linearGradient>
        <radialGradient id="hv-mist" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#9aa3a8" stopOpacity="0.11" />
          <stop offset="1" stopColor="#9aa3a8" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="hv-fade" cx="360" cy="560" r="330" gradientUnits="userSpaceOnUse">
          <stop offset="0.45" stopColor="#fff" />
          <stop offset="1" stopColor="#000" />
        </radialGradient>
        <mask id="hv-board-mask" maskUnits="userSpaceOnUse" x="0" y="440" width="720" height="260">
          <rect x="0" y="440" width="720" height="260" fill="url(#hv-fade)" />
        </mask>
        <clipPath id="hv-knight-clip">
          <path d={KNIGHT_BODY} />
          <path d={KNIGHT_HEAD} />
        </clipPath>
      </defs>

      {/* the single light source */}
      <rect className="hv-light" width="720" height="700" fill="url(#hv-light)" />

      {/* halo: concentric hairlines turning at different, very slow speeds */}
      <g className="hv-halo" transform="translate(430 400)">
        <circle r="250" className="hv-ring hv-ring--ticks hv-spin hv-spin--slow" />
        <circle r="206" className="hv-ring hv-ring--solid" />
        <circle r="162" className="hv-ring hv-ring--dash hv-spin hv-spin--rev" />
        <circle r="120" className="hv-ring hv-ring--solid hv-ring--inner" />
        <circle r="120" className="hv-ring hv-ring--arc hv-spin hv-spin--mid" />
        <g className="hv-spin hv-spin--orbit">
          <circle r="216" fill="none" stroke="none" />
          <circle cx="206" cy="0" r="3.2" className="hv-orb" />
          <circle cx="206" cy="0" r="9" className="hv-orb-halo" />
        </g>
        <circle r="96" fill="url(#hv-stage)" />
      </g>

      {/* hairline forest on the horizon */}
      <g className="hv-forest">
        {[0, 1, 2].map(g => (
          <g key={g} className={`hv-sway hv-sway--${g}`}>
            {art.trunks.filter(t => t.g === g).map(t => (
              <line key={t.x} x1={t.x} x2={t.x} y1={Y0 - t.h} y2={Y0 + 4} stroke="url(#hv-trunk)" strokeOpacity={t.o} strokeWidth="1" />
            ))}
          </g>
        ))}
        <path className="hv-pines hv-pines--back" d={art.pinesBack.join('')} />
        <path className="hv-pines hv-pines--front" d={art.pinesFront.join('')} />
      </g>
      <rect className="hv-mist hv-mist--a" x="-120" y="430" width="640" height="70" fill="url(#hv-mist)" />
      <rect className="hv-mist hv-mist--b" x="240" y="452" width="640" height="60" fill="url(#hv-mist)" />

      {/* the board, assembling from the knight outward */}
      <g mask="url(#hv-board-mask)">
        {art.squares.map(s => (
          <polygon key={s.key} points={s.d} className={`hv-sq ${s.light ? 'hv-sq--l' : 'hv-sq--d'}`}
            style={{ animationDelay: `${s.delay}s` }} />
        ))}
      </g>

      {/* the move: b2 to c4, traced by a comet */}
      <g className="hv-move">
        <polygon points={quad(1, 6)} className="hv-from" />
        <polygon points={quad(2, 4)} className="hv-to" />
        <path d={MOVE_D} className="hv-path" />
        <path d={MOVE_D} className="hv-comet hv-comet--glow" pathLength="100" />
        <path d={MOVE_D} className="hv-comet" pathLength="100" />
        <ellipse className="hv-ripple" cx={f((MOVE_TO[0]))} cy={f(MOVE_TO[1])} rx="30" ry="9" />
        <text className="hv-tag" x={f(MOVE_TO[0] + 38)} y={f(MOVE_TO[1] + 4)}>Nc4</text>
      </g>

      {/* the knight: shadow, body, rim light and a slow specular pass */}
      <ellipse className="hv-shadow" cx="430" cy="516" rx="124" ry="17" fill="url(#hv-shadow-g)" />
      <g className="hv-knight">
        <g transform="translate(270 268) scale(7.2) translate(-4 -5)">
          <path d={KNIGHT_BODY} fill="url(#hv-body)" />
          <path d={KNIGHT_HEAD} fill="url(#hv-body)" />
          <g clipPath="url(#hv-knight-clip)">
            <g className="hv-spec">
              <rect x="-20" y="0" width="14" height="50" fill="url(#hv-spec)" transform="skewX(-14)" />
            </g>
          </g>
          <path d={KNIGHT_BODY} fill="none" stroke="url(#hv-rim)" strokeWidth="0.34" strokeLinejoin="round" />
          <path d={KNIGHT_HEAD} fill="none" stroke="url(#hv-rim)" strokeWidth="0.34" strokeLinejoin="round" />
          <circle cx="9" cy="25.5" r="0.62" fill="#08090b" />
          <ellipse cx="14.5" cy="15.6" rx="0.5" ry="1.5" transform="matrix(.866 .5 -.5 .866 9.693 -5.173)" fill="#08090b" />
        </g>
      </g>

      {/* dust in the light */}
      <g className="hv-motes">
        {art.motes.map(m => (
          <circle key={m.key} className="hv-mote" cx={m.x} cy={m.y} r={m.r}
            style={{
              animationDuration: `${m.dur}s`,
              animationDelay: `${m.delay}s`,
              ['--dx' as string]: `${m.dx}px`,
              ['--dy' as string]: `${m.dy}px`,
              ['--o' as string]: m.o,
            }} />
        ))}
      </g>
    </svg>
  )
}
