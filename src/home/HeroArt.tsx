/**
 * Home hero artwork: a monumental trident planted in a dark, glossy board at the
 * edge of a hairline forest, inside a slowly turning halo.
 *
 * How it plays, in order (about four seconds):
 *  1. the board assembles outward from the trident's base
 *  2. the trident is drawn as a single bright hairline, from the foot to the tips
 *  3. its body fades in under the line, rim-lit from the one light source (top right)
 *  4. the three prong tips ignite in turn, and ripples start travelling over the board
 *  5. a slow specular sweep and drifting dust keep it alive
 *
 * Everything is vector and CSS-animated (no canvas, no filters). The resting state of every
 * element is its final state, so reduced motion shows a finished picture.
 * The trident is the same drawing as the brand mark (components/BrandMark.tsx).
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
function bp(c: number, r: number): [number, number] {
  const d = depth(r)
  const half = W0 + (W1 - W0) * d
  return [f(BX + (c / 8 - 0.5) * 2 * half), f(Y0 + (Y1 - Y0) * d)]
}
const quad = (c: number, r: number) =>
  [bp(c, r), bp(c + 1, r), bp(c + 1, r + 1), bp(c, r + 1)].map(p => p.join(',')).join(' ')

// ── the trident, in the brand mark's 48 unit grid ──────────────────────────
const SHAFT = 'M24 12V44.5'
const COLLAR = 'M19.5 37h9'
const PRONGS = 'M10 10v8.5C10 27 16.5 31 24 31s14-4 14-12.5V10'
const HEADS = ['M24 2.5 29.5 12 24 9.8 18.5 12z', 'M10 3.5 13.4 10 10 8.6 6.6 10z', 'M38 3.5 41.4 10 38 8.6 34.6 10z']
const TIPS: [number, number][] = [[24, 4.2], [10, 5.1], [38, 5.1]]
const SCALE = 9
const FOOT: [number, number] = [430, 520]   // where the shaft meets the board
const PLACE = `translate(${f(FOOT[0] - 24 * SCALE)} ${f(FOOT[1] - 44.5 * SCALE)}) scale(${SCALE})`

/** A hairline forest pine: trunk plus three stacked chevrons. */
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

/** Ripples travelling over the board from the trident's foot. */
const RIPPLES = [44, 96, 158, 232, 318]

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
    const r = rng(20261101)

    const squares: { d: string; light: boolean; delay: number; key: string }[] = []
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        squares.push({
          key: `${col}-${row}`,
          d: quad(col, row),
          light: (col + row) % 2 === 0,
          // the board grows outward from the foot of the trident
          delay: f(0.2 + Math.hypot((col + 0.5 - 5.1) * 0.9, (row + 0.5 - 1.6) * 1.2) * 0.12),
        })
      }
    }

    const trunks: { x: number; h: number; o: number; g: number }[] = []
    for (let i = 0; i < 70; i++) {
      const x = (i / 69) * 760 - 20 + (r() - 0.5) * 8
      const ridge = 0.5 + 0.5 * Math.sin(x * 0.011 + 1.3) * Math.cos(x * 0.0043)
      trunks.push({ x: f(x), h: f(46 + ridge * 96 + r() * 54), o: f(0.1 + r() * 0.18), g: i % 3 })
    }

    const pinesBack: string[] = []
    const pinesFront: string[] = []
    const xs = [24, 74, 128, 196, 600, 640, 684, 716]
    xs.forEach((x, i) => {
      const h = 120 + r() * 90
      const w = 22 + r() * 12
      pinesBack.push(pine(x + (r() - 0.5) * 18, Y0 + 6, h * 0.7, w * 0.8))
      if (i % 2 === 0) pinesFront.push(pine(x + 18, Y0 + 26, h, w))
    })

    const motes = Array.from({ length: 26 }, (_, i) => ({
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

  const shapes = (
    <>
      <path d={SHAFT} /><path d={COLLAR} /><path d={PRONGS} />
    </>
  )

  return (
    <svg ref={root} className={`hv ${className}`} viewBox="0 0 720 700" preserveAspectRatio="xMidYMid slice"
      aria-hidden="true" focusable="false">
      <defs>
        <radialGradient id="hv-light" cx="560" cy="110" r="470" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#c9cfd2" stopOpacity="0.2" />
          <stop offset="0.35" stopColor="#7c8891" stopOpacity="0.09" />
          <stop offset="1" stopColor="#08090b" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="hv-stage" cx="430" cy="340" r="260" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#12161a" stopOpacity="0.95" />
          <stop offset="0.7" stopColor="#0d1013" stopOpacity="0.5" />
          <stop offset="1" stopColor="#0d1013" stopOpacity="0" />
        </radialGradient>
        {/* metal, in the trident's own grid: lit from the top right, falling into shadow bottom left */}
        <linearGradient id="hv-steel" gradientUnits="userSpaceOnUse" x1="40" y1="2" x2="8" y2="46">
          <stop offset="0" stopColor="#4a555d" />
          <stop offset="0.45" stopColor="#222a31" />
          <stop offset="1" stopColor="#0d1013" />
        </linearGradient>
        <linearGradient id="hv-edge" gradientUnits="userSpaceOnUse" x1="40" y1="2" x2="8" y2="46">
          <stop offset="0" stopColor="#f1eee4" />
          <stop offset="0.5" stopColor="#b3bbbf" />
          <stop offset="1" stopColor="#7c8891" stopOpacity="0.6" />
        </linearGradient>
        <linearGradient id="hv-spec" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#f1eee4" stopOpacity="0" />
          <stop offset="0.5" stopColor="#f1eee4" stopOpacity="0.55" />
          <stop offset="1" stopColor="#f1eee4" stopOpacity="0" />
        </linearGradient>
        <radialGradient id="hv-bead">
          <stop offset="0" stopColor="#fbf8ee" stopOpacity="1" />
          <stop offset="0.25" stopColor="#e6e3da" stopOpacity="0.85" />
          <stop offset="1" stopColor="#c9cfd2" stopOpacity="0" />
        </radialGradient>
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
        {/* the trident's silhouette, used to keep the light sweep inside the metal */}
        <mask id="hv-tri-mask" maskUnits="userSpaceOnUse" x="0" y="0" width="48" height="48">
          <g fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            {shapes}
            {HEADS.map(d => <path key={d} d={d} fill="#fff" />)}
          </g>
        </mask>
      </defs>

      {/* the single light source */}
      <rect className="hv-light" width="720" height="700" fill="url(#hv-light)" />

      {/* halo: concentric hairlines turning at different, very slow speeds, centred on the trident's crown */}
      <g className="hv-halo" transform="translate(430 330)">
        <circle r="262" className="hv-ring hv-ring--ticks hv-spin hv-spin--slow" />
        <circle r="214" className="hv-ring hv-ring--solid" />
        <circle r="168" className="hv-ring hv-ring--dash hv-spin hv-spin--rev" />
        <circle r="124" className="hv-ring hv-ring--solid hv-ring--inner" />
        <circle r="124" className="hv-ring hv-ring--arc hv-spin hv-spin--mid" />
        <g className="hv-spin hv-spin--orbit">
          <circle r="224" fill="none" stroke="none" />
          <circle cx="214" cy="0" r="3.2" className="hv-orb" />
          <circle cx="214" cy="0" r="9" className="hv-orb-halo" />
        </g>
        <circle r="110" fill="url(#hv-stage)" />
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

      {/* the board, growing outward from the trident's foot */}
      <g mask="url(#hv-board-mask)">
        {art.squares.map(s => (
          <polygon key={s.key} points={s.d} className={`hv-sq ${s.light ? 'hv-sq--l' : 'hv-sq--d'}`}
            style={{ animationDelay: `${s.delay}s` }} />
        ))}
      </g>

      {/* ripples: the board behaves like still water around the trident */}
      <g className="hv-ripples">
        <ellipse className="hv-contact" cx={FOOT[0]} cy={FOOT[1]} rx="30" ry="5" />
        {RIPPLES.map((rx, i) => (
          <ellipse key={rx} className="hv-ripple" cx={FOOT[0]} cy={FOOT[1]} rx={rx} ry={f(rx * 0.15)}
            style={{ animationDelay: `${f(3.4 + i * 1.15)}s` }} />
        ))}
      </g>

      {/* the trident */}
      <g className="hv-rise">
      <g className="hv-trident" transform={PLACE}>
        {/* aura: a wide, faint breath of light behind the metal */}
        <g className="hv-aura" fill="none" stroke="#c9cfd2" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">{shapes}</g>

        {/* body */}
        <g className="hv-body" fill="none" stroke="url(#hv-steel)" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
          {shapes}
          {HEADS.map(d => <path key={d} d={d} fill="url(#hv-steel)" strokeWidth="0.4" />)}
        </g>

        {/* rim light: one bright hairline drawn first, from the foot to the tips */}
        <g className="hv-edge" fill="none" stroke="url(#hv-edge)" strokeWidth="0.45" strokeLinecap="round" strokeLinejoin="round"
          transform="translate(0.3 -0.3)">
          <path d={SHAFT} pathLength="100" style={{ ['--i' as string]: 0 }} />
          <path d={COLLAR} pathLength="100" style={{ ['--i' as string]: 1 }} />
          <path d={PRONGS} pathLength="100" style={{ ['--i' as string]: 2 }} />
          {HEADS.map((d, i) => <path key={d} d={d} pathLength="100" style={{ ['--i' as string]: 3 + i }} />)}
        </g>

        {/* a slow specular pass, kept inside the metal */}
        <g mask="url(#hv-tri-mask)">
          <g className="hv-spec">
            <rect x="-14" y="-2" width="7" height="52" fill="url(#hv-spec)" transform="skewX(-14)" />
          </g>
        </g>

        {/* the prong tips ignite one after another */}
        {TIPS.map(([x, y], i) => (
          <g key={i} className="hv-tip" style={{ ['--t' as string]: i }}>
            <circle cx={x} cy={y} r="2.7" fill="url(#hv-bead)" />
            <circle cx={x} cy={y} r="0.55" fill="#fbf8ee" />
          </g>
        ))}
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
