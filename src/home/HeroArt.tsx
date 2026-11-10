/**
 * Home hero artwork: a monumental trident planted in a dark, glossy board at the
 * edge of a hairline forest, inside a halo of concentric rings.
 *
 * One scene, one origin, one clock. Everything radiates from the trident's foot and is
 * choreographed against the timeline constants in styles/hero.css (--t-*):
 *
 *   0.30s  a point of light ignites at the foot
 *   0.35s  the board and the forest spread outward from the foot, front lit as it passes
 *   1.40s  the rim light is drawn: the shaft climbs from the foot at a constant speed, the
 *          collar opens when the line reaches it, the two prongs fan out from the junction
 *          in perfect mirror, the spear heads are traced last
 *   1.75s  the metal fills in behind the line, bottom to top
 *   3.20s  the crown tip ignites, then both side tips together (3.40s)
 *   3.40s  the halo is released outward, ring by ring, and two orbs leave the side tips
 *   3.40s  and from here on, one 6s heartbeat: tips, aura, ripples and glint all land on it together
 *
 * Alignment is geometric, not eyeballed: tip beads sit exactly on the spear apexes, the key ring
 * passes exactly through both side apexes, and the halo is centred on the trident's own centre.
 * Everything is vector and CSS-animated (no canvas, no filters). The resting state of every
 * element is its final state, so reduced motion shows a finished picture.
 * The trident is the same drawing as the brand mark (components/BrandMark.tsx).
 */
import { useEffect, useMemo, useRef } from 'react'
import type { CSSProperties } from 'react'
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
const vars = (o: Record<string, string | number>) => o as CSSProperties
const TAU = Math.PI * 2
const circ = (r: number) => Math.round(TAU * r * 100) / 100
/** n evenly spaced dashes that divide the circumference exactly, so the seam is invisible. */
const dashes = (r: number, n: number, dash: number) => { const p = (TAU * r) / n; return `${f(dash)} ${Math.round((p - dash) * 1000) / 1000}` }

// ── the trident, in the brand mark's 48 unit grid ──────────────────────────
const SCALE = 9
const FOOT: [number, number] = [430, 520]            // where the shaft meets the board
const GX = (x: number) => FOOT[0] + (x - 24) * SCALE  // grid -> scene
const GY = (y: number) => FOOT[1] + (y - 44.5) * SCALE
const PLACE = `translate(${f(GX(0))} ${f(GY(0))}) scale(${SCALE})`

const SHAFT = 'M24 44.5V12'                           // drawn from the foot upward
const COLLAR_L = 'M24 37H19.5'
const COLLAR_R = 'M24 37H28.5'
const PRONG_L = 'M24 31C16.5 31 10 27 10 18.5V10'      // both prongs start at the junction
const PRONG_R = 'M24 31C31.5 31 38 27 38 18.5V10'
const PRONGS = 'M10 10v8.5C10 27 16.5 31 24 31s14-4 14-12.5V10'
const SHAPES = `${SHAFT}${COLLAR_L}${COLLAR_R}${PRONGS}`
const HEAD_C = 'M24 9.8 18.5 12 24 2.5 29.5 12z'   // traced from the notch, so the line flows out of the shaft
const HEAD_L = 'M10 8.6 6.6 10 10 3.5 13.4 10z'
const HEAD_R = 'M38 8.6 34.6 10 38 3.5 41.4 10z'
const HEADS = [HEAD_C, HEAD_L, HEAD_R]
/** Spear apexes: the beads sit exactly on these points. */
const TIPS: { x: number; y: number; side: 'c' | 's' }[] = [
  { x: 24, y: 2.5, side: 'c' },
  { x: 10, y: 3.5, side: 's' },
  { x: 38, y: 3.5, side: 's' },
]

// ── halo, centred on the trident's own centre ──────────────────────────────
const HALO: [number, number] = [FOOT[0], f((GY(2.5) + GY(44.5)) / 2)]   // 430, 331.5 -> middle of its height
const tipRel = [GX(38) - HALO[0], GY(3.5) - HALO[1]]
/** The key ring passes exactly through both side apexes. */
const R_KEY = Math.round(Math.hypot(tipRel[0], tipRel[1]) * 100) / 100
const TIP_ANGLE = Math.round((Math.atan2(tipRel[1], tipRel[0]) * 180 / Math.PI) * 100) / 100   // right apex, degrees

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

/** Ripples travelling over the board from the trident's foot: one pulse, three rings, on the beat. */
const RIPPLES = [64, 150, 262]

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

    // the board spreads outward from the foot; the front is measured on the board's own ellipse
    const squares: { d: string; light: boolean; delay: number; key: string }[] = []
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const [cx, cy] = bp(col + 0.5, row + 0.5)
        squares.push({
          key: `${col}-${row}`,
          d: quad(col, row),
          light: (col + row) % 2 === 0,
          delay: f(Math.hypot(cx - FOOT[0], (cy - FOOT[1]) * 2.3) * 0.0024),
        })
      }
    }

    // the forest rises from the foot outward as well, so the whole scene has one origin
    const trunks: { x: number; h: number; o: number; g: number; delay: number }[] = []
    for (let i = 0; i < 70; i++) {
      const x = (i / 69) * 760 - 20 + (r() - 0.5) * 8
      const ridge = 0.5 + 0.5 * Math.sin(x * 0.011 + 1.3) * Math.cos(x * 0.0043)
      trunks.push({
        x: f(x), h: f(46 + ridge * 96 + r() * 54), o: f(0.1 + r() * 0.18), g: i % 3,
        delay: f(Math.abs(x - FOOT[0]) * 0.0022),
      })
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

    // dust: evenly phased across two exact loop lengths, so the drift is continuous and never bunches
    const motes = Array.from({ length: 18 }, (_, i) => {
      const dur = i % 2 === 0 ? 12 : 18
      return {
        key: i,
        x: f(190 + r() * 480),
        y: f(200 + r() * 400),
        r: f(0.7 + r() * 1.3),
        dx: Math.round(10 + r() * 30),
        dy: -Math.round(70 + r() * 110),
        dur,
        delay: -f((i / 18) * dur),
        o: f(0.35 + r() * 0.45),
      }
    })

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
        {/* the trident's silhouette, used to keep the light glint inside the metal */}
        <mask id="hv-tri-mask" maskUnits="userSpaceOnUse" x="0" y="0" width="48" height="48">
          <g fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d={SHAPES} />
            {HEADS.map(d => <path key={d} d={d} fill="#fff" />)}
          </g>
        </mask>
        {/* the metal fills in behind the rim light, bottom to top, with a soft leading edge */}
        <linearGradient id="hv-wipe-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0" />
          <stop offset="0.14" stopColor="#fff" />
          <stop offset="1" stopColor="#fff" />
        </linearGradient>
        <mask id="hv-fill-mask" maskUnits="userSpaceOnUse" x="-4" y="-8" width="56" height="60">
          <rect className="hv-wipe" x="-4" y="-8" width="56" height="56" fill="url(#hv-wipe-grad)" />
        </mask>
      </defs>

      {/* the single light source */}
      <rect className="hv-light" width="720" height="700" fill="url(#hv-light)" />

      {/* hairline forest on the horizon, rising outward from the trident's x */}
      <g className="hv-forest">
        {[0, 1, 2].map(g => (
          <g key={g} className={`hv-sway hv-sway--${g}`}>
            {art.trunks.filter(t => t.g === g).map(t => (
              <line key={t.x} className="hv-trunk" x1={t.x} x2={t.x} y1={f(Y0 - t.h)} y2={Y0 + 4}
                stroke="url(#hv-trunk)" strokeOpacity={t.o} strokeWidth="1" style={vars({ '--d': t.delay })} />
            ))}
          </g>
        ))}
        <path className="hv-pines hv-pines--back" d={art.pinesBack.join('')} />
        <path className="hv-pines hv-pines--front" d={art.pinesFront.join('')} />
      </g>
      <rect className="hv-mist hv-mist--a" x="-120" y="430" width="640" height="70" fill="url(#hv-mist)" />
      <rect className="hv-mist hv-mist--b" x="240" y="452" width="640" height="60" fill="url(#hv-mist)" />

      {/* the board, spreading outward from the trident's foot */}
      <g mask="url(#hv-board-mask)">
        {art.squares.map(s => (
          <polygon key={s.key} points={s.d} className={`hv-sq ${s.light ? 'hv-sq--l' : 'hv-sq--d'}`}
            style={vars({ '--d': s.delay })} />
        ))}
      </g>

      {/* the origin: a point of light at the foot, then ripples on the beat */}
      <g className="hv-ripples">
        <ellipse className="hv-contact" cx={FOOT[0]} cy={FOOT[1]} rx="30" ry="5" />
        <ellipse className="hv-contact hv-contact--core" cx={FOOT[0]} cy={FOOT[1]} rx="9" ry="1.6" />
        {RIPPLES.map((rx, i) => (
          <ellipse key={rx} className="hv-ripple" cx={FOOT[0]} cy={FOOT[1]} rx={rx} ry={f(rx * 0.15)}
            style={vars({ '--i': i })} />
        ))}
      </g>

      {/* halo: released outward from the trident's centre once the tips are lit */}
      <g className="hv-halo" transform={`translate(${HALO[0]} ${HALO[1]})`}>
        <circle r="112" fill="url(#hv-stage)" className="hv-stage" />
        <g className="hv-rg" style={vars({ '--i': 0 })}>
          <g transform="rotate(-90)"><circle r="100" className="hv-ring hv-ring--inner hv-draw" style={vars({ '--L': `${circ(100)}px` })} /></g>
        </g>
        <g className="hv-rg" style={vars({ '--i': 1 })}>
          <circle r="100" className="hv-ring hv-ring--arc hv-spin hv-spin--mid" strokeDasharray={`${f(circ(100) * 0.22)} ${f(circ(100) * 0.78)}`} />
        </g>
        <g className="hv-rg" style={vars({ '--i': 2 })}>
          <circle r="152" className="hv-ring hv-ring--dash hv-spin hv-spin--rev" strokeDasharray={dashes(152, 90, 2.3)} />
        </g>
        <g className="hv-rg" style={vars({ '--i': 3 })}>
          <g transform="rotate(-90)"><circle r={R_KEY} className="hv-ring hv-ring--solid hv-ring--key hv-draw" style={vars({ '--L': `${circ(R_KEY)}px` })} /></g>
        </g>
        <g className="hv-rg" style={vars({ '--i': 4 })}>
          <circle r="264" className="hv-ring hv-ring--ticks hv-spin hv-spin--slow" strokeDasharray={dashes(264, 96, 1.2)} />
        </g>
        {/* two orbs leave the side tips together and travel the key ring in mirror */}
        {[1, -1].map(dir => (
          <g key={dir} transform={`rotate(${dir === 1 ? TIP_ANGLE : -180 - TIP_ANGLE})`}>
            <g className="hv-orb-wrap">
              <g className={`hv-spin hv-spin--orbit${dir === 1 ? '' : ' hv-ccw'}`}>
                <circle cx={R_KEY} cy="0" r="3.2" className="hv-orb" />
                <circle cx={R_KEY} cy="0" r="9" className="hv-orb-halo" />
              </g>
            </g>
          </g>
        ))}
      </g>

      {/* the trident */}
      <g className="hv-trident" transform={PLACE}>
        {/* aura: a wide, faint breath of light behind the metal */}
        <g className="hv-aura" fill="none" stroke="#c9cfd2" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <path d={SHAPES} />
        </g>

        {/* body: fills in behind the rim light, bottom to top */}
        <g mask="url(#hv-fill-mask)">
          <g className="hv-body" fill="none" stroke="url(#hv-steel)" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
            <path d={SHAPES} />
            {HEADS.map(d => <path key={d} d={d} fill="url(#hv-steel)" strokeWidth="0.4" />)}
          </g>
        </g>

        {/* rim light: constant speed, so every hand-off lands exactly when the line arrives */}
        <g className="hv-edge" fill="none" stroke="url(#hv-edge)" strokeWidth="0.45" strokeLinecap="round" strokeLinejoin="round">
          <path className="hv-e hv-e--shaft" d={SHAFT} style={vars({ '--L': '32.5px' })} />
          <path className="hv-e hv-e--collar" d={COLLAR_L} style={vars({ '--L': '4.5px' })} />
          <path className="hv-e hv-e--collar" d={COLLAR_R} style={vars({ '--L': '4.5px' })} />
          <path className="hv-e hv-e--prong" d={PRONG_L} style={vars({ '--L': '29.68px' })} />
          <path className="hv-e hv-e--prong" d={PRONG_R} style={vars({ '--L': '29.68px' })} />
          <path className="hv-e hv-e--head-c" d={HEAD_C} style={vars({ '--L': '33.81px' })} />
          <path className="hv-e hv-e--head-s" d={HEAD_L} style={vars({ '--L': '22.03px' })} />
          <path className="hv-e hv-e--head-s" d={HEAD_R} style={vars({ '--L': '22.03px' })} />
        </g>

        {/* a slow glint, kept inside the metal, on the beat */}
        <g mask="url(#hv-tri-mask)">
          <g className="hv-spec">
            <rect x="-14" y="-2" width="7" height="52" fill="url(#hv-spec)" transform="skewX(-14)" />
          </g>
        </g>

        {/* the tips: each bead sits exactly on its apex; crown first, then both sides together */}
        {TIPS.map(t => (
          <g key={t.x} transform={`translate(${t.x} ${t.y})`}>
            <g className={`hv-tip hv-tip--${t.side}`}>
              <g className="hv-breathe">
                <circle r="2.7" fill="url(#hv-bead)" />
                <circle r="0.55" fill="#fbf8ee" />
                <path className="hv-flare" d="M-3.4 0H3.4M0 -3.4V3.4" />
              </g>
            </g>
          </g>
        ))}
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
