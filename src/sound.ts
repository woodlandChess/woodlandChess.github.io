// ── Woodland sound ──────────────────────────────────────────────────────────
//
// A tiny synth - no audio files to ship - voiced like a quiet private library:
//   • pieces are set down on a wooden board: a crisp contact "clack", a woody
//     knock with a few ringing resonances, the piece's own thud and the hollow
//     boom of the board underneath
//   • captures are a harder strike of wood on wood, with the captured piece
//     knocked aside; check is a muted mallet-bell
//   • results are slow glockenspiel phrases (rising = win, falling = loss)
// Everything runs through one gentle compressor and a short warm room reverb,
// with small random variation so repeated moves never sound machine-gunned.
//
// One shared on/off preference drives every mode (Computer, Online, Puzzles).

import { landingDelayMs } from './boardTiming'

export type SoundName =
  | 'move' | 'capture' | 'check' | 'castle' | 'promote'
  | 'start' | 'win' | 'loss' | 'draw' | 'notify' | 'wrong' | 'achievement'

const PREF_KEY = 'woodland-chess:sound'

// ── preference store (usable with useSyncExternalStore) ──────────────────────
const listeners = new Set<() => void>()

function readPref(): boolean {
  try { return localStorage.getItem(PREF_KEY) !== '0' } catch { return true }
}
let enabled = readPref()

// ── audio graph (built lazily, inside a user gesture) ────────────────────────
interface Bus { dry: GainNode; send: GainNode }
let ctx: AudioContext | null = null
let bus: Bus | null = null
let noiseBuf: AudioBuffer | null = null

function createContext(): AudioContext | null {
  if (typeof window === 'undefined') return null
  const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!Ctor) return null
  try { return new Ctor() } catch { return null }
}

/** A short, dark room: exponentially decaying noise, smoothed so it stays warm. */
function roomImpulse(c: AudioContext): AudioBuffer {
  const seconds = 0.9
  const len = Math.floor(c.sampleRate * seconds)
  const buf = c.createBuffer(2, len, c.sampleRate)
  for (let ch = 0; ch < 2; ch++) {
    const data = buf.getChannelData(ch)
    let lp = 0
    for (let i = 0; i < len; i++) {
      const decay = Math.pow(1 - i / len, 3.2)
      lp += ((Math.random() * 2 - 1) - lp) * 0.22        // one-pole low-pass = warm tail
      data[i] = lp * decay
    }
  }
  return buf
}

function ensure(): AudioContext | null {
  if (!ctx) {
    ctx = createContext()
    if (!ctx) return null
    const master = ctx.createGain()
    master.gain.value = 0.85
    const comp = ctx.createDynamicsCompressor()
    comp.threshold.value = -20
    comp.ratio.value = 3
    comp.attack.value = 0.006
    comp.release.value = 0.25
    master.connect(comp)
    comp.connect(ctx.destination)

    const dry = ctx.createGain()
    dry.connect(master)
    const send = ctx.createGain()
    const verb = ctx.createConvolver()
    verb.buffer = roomImpulse(ctx)
    const wet = ctx.createGain()
    wet.gain.value = 0.55
    send.connect(verb)
    verb.connect(wet)
    wet.connect(master)
    bus = { dry, send }

    const n = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.6), ctx.sampleRate)
    const d = n.getChannelData(0)
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1
    noiseBuf = n
  }
  return ctx
}

let resumePromise: Promise<void> | null = null
function resumeFromGesture(): Promise<void> {
  const c = ensure()
  if (!c || c.state === 'running') return Promise.resolve()
  // Prime the destination synchronously inside the trusted touch/click. A
  // silent source is required by some iOS Safari releases before later nodes
  // are audible, even after AudioContext.resume() resolves.
  try {
    const source = c.createOscillator()
    const gain = c.createGain()
    gain.gain.value = 0
    source.connect(gain)
    gain.connect(c.destination)
    source.start()
    source.stop(c.currentTime + 0.01)
  } catch { /* resume below remains the fallback */ }
  // Call resume on every trusted gesture: Safari can reject an earlier resume
  // when it was initiated by a passive document listener.
  if (!resumePromise) {
    resumePromise = c.resume().catch(() => { /* retried on the next user gesture */ }).finally(() => { resumePromise = null })
  }
  return resumePromise
}

// Browsers only allow audio after a gesture: prepare the context on the first one.
if (typeof window !== 'undefined') {
  const unlock = () => {
    void resumeFromGesture()
  }
  for (const ev of ['pointerdown', 'touchstart', 'touchend', 'keydown']) window.addEventListener(ev, unlock, { passive: true })
}

// ── voices ────────────────────────────────────────────────────────────────────
function wire(c: AudioContext, node: AudioNode, wet: number) {
  node.connect(bus!.dry)
  if (wet > 0) {
    const s = c.createGain()
    s.gain.value = wet
    node.connect(s)
    s.connect(bus!.send)
  }
}

/** A round wooden body: a short pitch-dropping tone, low-passed so it stays soft. */
function body(c: AudioContext, t: number, f0: number, f1: number, dur: number, peak: number, opts: { type?: OscillatorType; lp?: number; wet?: number } = {}) {
  const osc = c.createOscillator()
  osc.type = opts.type ?? 'triangle'
  osc.frequency.setValueAtTime(f0, t)
  osc.frequency.exponentialRampToValueAtTime(Math.max(30, f1), t + dur * 0.55)
  const g = c.createGain()
  g.gain.setValueAtTime(0.0001, t)
  g.gain.linearRampToValueAtTime(peak, t + 0.004)
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  const lp = c.createBiquadFilter()
  lp.type = 'lowpass'
  lp.frequency.value = opts.lp ?? 2200
  lp.Q.value = 0.5
  osc.connect(g); g.connect(lp)
  wire(c, lp, opts.wet ?? 0.22)
  osc.start(t)
  osc.stop(t + dur + 0.05)
}

/** The felt-muffled knock of wood meeting wood: a few ms of band-passed noise. */
function knock(c: AudioContext, t: number, freq: number, dur: number, peak: number) {
  if (!noiseBuf) return
  const src = c.createBufferSource()
  src.buffer = noiseBuf
  const bp = c.createBiquadFilter()
  bp.type = 'bandpass'
  bp.frequency.value = freq
  bp.Q.value = 0.9
  const g = c.createGain()
  g.gain.setValueAtTime(0.0001, t)
  g.gain.linearRampToValueAtTime(peak, t + 0.002)
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  src.connect(bp); bp.connect(g)
  wire(c, g, 0.12)
  src.start(t, Math.random() * 0.4)
  src.stop(t + dur + 0.02)
}

/** A soft-mallet bell: fundamental plus two gentle partials, long smooth decay. */
function bell(c: AudioContext, t: number, f: number, dur: number, peak: number, wet = 0.55) {
  const parts: Array<[number, number]> = [[1, 1], [2.01, 0.26], [3.97, 0.08]]
  for (const [mult, amp] of parts) {
    const osc = c.createOscillator()
    osc.type = 'sine'
    osc.frequency.value = f * mult
    const g = c.createGain()
    const d = dur / (mult > 1 ? mult * 0.8 : 1)
    g.gain.setValueAtTime(0.0001, t)
    g.gain.linearRampToValueAtTime(peak * amp, t + 0.008)
    g.gain.exponentialRampToValueAtTime(0.0001, t + d)
    osc.connect(g)
    wire(c, g, wet)
    osc.start(t)
    osc.stop(t + d + 0.05)
  }
}

/** A warm sustained pad note for the game-start chord. */
function pad(c: AudioContext, t: number, f: number, dur: number, peak: number) {
  const osc = c.createOscillator()
  osc.type = 'sine'
  osc.frequency.value = f
  const g = c.createGain()
  g.gain.setValueAtTime(0.0001, t)
  g.gain.linearRampToValueAtTime(peak, t + 0.09)
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  const lp = c.createBiquadFilter()
  lp.type = 'lowpass'
  lp.frequency.value = 1500
  osc.connect(g); g.connect(lp)
  wire(c, lp, 0.6)
  osc.start(t)
  osc.stop(t + dur + 0.05)
}

const vary = (amount = 0.06) => 1 + (Math.random() * 2 - 1) * amount

/** A few ms of bright noise: the hard contact of wood meeting wood. */
function tick(c: AudioContext, t: number, peak: number, dur: number, hp = 2200) {
  if (!noiseBuf) return
  const src = c.createBufferSource()
  src.buffer = noiseBuf
  const f = c.createBiquadFilter()
  f.type = 'highpass'
  f.frequency.value = hp * vary(0.1)
  const g = c.createGain()
  g.gain.setValueAtTime(0.0001, t)
  g.gain.linearRampToValueAtTime(peak, t + 0.0009)
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  src.connect(f); f.connect(g)
  wire(c, g, 0.03)
  src.start(t, Math.random() * 0.4)
  src.stop(t + dur + 0.02)
}

/** One ringing resonance of the wood: a quickly dying, barely falling sine. */
function mode(c: AudioContext, t: number, f: number, dur: number, peak: number) {
  body(c, t, f, f * 0.975, dur, peak, { type: 'sine', lp: 6000, wet: 0.04 })
}

interface HitOpts { gain?: number; pitch?: number; hard?: number }

/**
 * Wooden piece meeting a wooden board. All layers start on the SAME instant
 * (staggering them made one move sound like a double tap):
 *   contact click + woody knock  -> the hard surface
 *   three resonant modes         -> what makes it read as wood, not plastic
 *   piece thud + hollow board    -> weight; the board is a resonating box
 */
function woodHit(c: AudioContext, t: number, { gain = 1, pitch = 1, hard = 1 }: HitOpts = {}) {
  const p = pitch * vary(0.05)
  tick(c, t, 0.30 * gain * hard, 0.007)
  knock(c, t, 1350 * p, 0.04, 0.26 * gain * hard)
  mode(c, t, 760 * p, 0.065, 0.20 * gain)
  mode(c, t, 1730 * p, 0.038, 0.09 * gain)
  mode(c, t, 2950 * p, 0.022, 0.04 * gain * hard)
  body(c, t, 235 * p, 150 * p, 0.12, 0.28 * gain, { type: 'triangle', lp: 800, wet: 0.04 })
  body(c, t, 128 * p, 84 * p, 0.2, 0.40 * gain, { type: 'sine', lp: 420, wet: 0.1 })
}

/** One piece set down. `weight` below 1 sounds heavier and lower (castling, captures). */
function place(c: AudioContext, t: number, gain = 1, weight = 1) {
  woodHit(c, t, { gain: 0.72 * gain, pitch: weight })
}

const VOICES: Record<SoundName, (c: AudioContext, t: number) => void> = {
  move: (c, t) => place(c, t),

  // A strike: harder, louder and lower than a quiet move, a sharp crack on top,
  // then the captured piece knocked aside (two soft, lower, uneven taps).
  capture: (c, t) => {
    woodHit(c, t, { gain: 0.92, pitch: 0.88, hard: 1.5 })
    tick(c, t, 0.2, 0.012, 3200)
    knock(c, t + 0.045, 900 * vary(0.1), 0.03, 0.09)
    body(c, t + 0.078, 330 * vary(0.08), 250, 0.06, 0.06, { type: 'triangle', lp: 900, wet: 0.04 })
  },

  check: (c, t) => {
    place(c, t)
    bell(c, t + 0.07, 784, 1.1, 0.07)
    bell(c, t + 0.07, 1175, 0.7, 0.03)
  },

  castle: (c, t) => {
    place(c, t, 1, 0.9)
    place(c, t + 0.12, 0.85, 0.8)
  },

  promote: (c, t) => {
    place(c, t)
    ;[523.25, 659.25, 783.99, 1046.5].forEach((f, i) => bell(c, t + 0.1 + i * 0.075, f, 0.9, 0.055))
  },

  start: (c, t) => {
    ;[196, 293.66, 392].forEach((f, i) => pad(c, t + i * 0.05, f, 1.8, 0.055))
  },

  win: (c, t) => {
    ;[392, 523.25, 659.25, 783.99].forEach((f, i) => bell(c, t + i * 0.15, f, 1.7, 0.085, 0.65))
  },

  loss: (c, t) => {
    ;[220, 174.61, 146.83].forEach((f, i) => bell(c, t + i * 0.2, f, 1.9, 0.08, 0.7))
  },

  draw: (c, t) => {
    bell(c, t, 392, 1.5, 0.07, 0.6)
    bell(c, t + 0.22, 329.63, 1.7, 0.07, 0.6)
  },

  notify: (c, t) => {
    bell(c, t, 587.33, 0.9, 0.065)
    bell(c, t, 880, 0.55, 0.025)
  },

  // A soft, low "thud" - corrective, never a buzzer.
  wrong: (c, t) => {
    body(c, t, 128, 78, 0.24, 0.38, { lp: 700, wet: 0.2 })
    body(c, t + 0.07, 110, 70, 0.22, 0.2, { lp: 600, wet: 0.2 })
  },

  achievement: (c, t) => {
    bell(c, t, 659.25, 1.1, 0.07)
    bell(c, t + 0.16, 880, 1.3, 0.07)
  },
}

// ── public API ────────────────────────────────────────────────────────────────
// Piece sounds go through a small gate so two moves in quick succession (our
// move + an instant engine/online reply) never land on top of each other and
// smear into one doubled click.
const PIECE_SOUNDS: ReadonlySet<SoundName> = new Set<SoundName>(['move', 'capture', 'check', 'castle', 'promote'])
/** Minimum distance between two piece sounds, in seconds. */
export const PIECE_GAP = 0.11
/** A piece sound that would have to wait longer than this is stale: drop it. */
export const PIECE_MAX_DELAY = 0.3
/** Identical sound requested again within this window is the same event. */
export const DUPLICATE_WINDOW = 0.035

let lastPieceAt = -Infinity
let lastName: SoundName | null = null
let lastNameAt = -Infinity

/** Pure scheduling rule (exported for tests). Returns the start time, or null to drop. */
export function scheduleSlot(
  now: number, lastStart: number, name: SoundName, prev: SoundName | null, prevAt: number,
): number | null {
  if (name === prev && now - prevAt < DUPLICATE_WINDOW) return null
  if (!PIECE_SOUNDS.has(name)) return now
  const start = Math.max(now, lastStart + PIECE_GAP)
  return start - now > PIECE_MAX_DELAY ? null : start
}

function playNow(name: SoundName, delay = 0): void {
  if (!enabled) return
  const c = ensure()
  if (!c || !bus) return
  if (c.state !== 'running') return
  const now = c.currentTime + 0.005 + delay
  const t = scheduleSlot(now, lastPieceAt, name, lastName, lastNameAt)
  if (t === null) return
  lastName = name
  lastNameAt = now
  if (PIECE_SOUNDS.has(name)) lastPieceAt = t
  VOICES[name](c, t)
}

// While the context is still waking up (iOS), keep only the NEWEST request.
// Replaying every queued request at once is what produced stacked "double" hits.
let pending: { name: SoundName; at: number; delay: number } | null = null

function play(name: SoundName): void {
  if (!enabled) return
  const c = ensure()
  if (!c || !bus) return
  // A piece sound waits for the slide so the click lands with the piece.
  const delay = PIECE_SOUNDS.has(name) ? landingDelayMs() / 1000 : 0
  if (c.state === 'running') { playNow(name, delay); return }
  pending = { name, at: performance.now(), delay }
  void resumeFromGesture().then(() => {
    const req = pending
    pending = null
    if (!req || c.state !== 'running') return
    if (performance.now() - req.at > 400) return          // too late to still feel connected
    playNow(req.name, req.delay)
  })
}

export const sound = {
  play,
  isEnabled: () => enabled,
  subscribe(listener: () => void) {
    listeners.add(listener)
    return () => { listeners.delete(listener) }
  },
  /** Turns sound on/off everywhere and remembers it. Turning on plays a soft confirmation. */
  setEnabled(next: boolean, opts: { confirm?: boolean } = {}) {
    if (next === enabled) return
    enabled = next
    try { localStorage.setItem(PREF_KEY, next ? '1' : '0') } catch { /* private mode */ }
    listeners.forEach(l => l())
    if (next && opts.confirm !== false) play('move')
  },
  /** Prepares audio inside a user gesture (also done automatically on first tap/key). */
  unlock: resumeFromGesture,
}

/** Which sound a chess.js move should make. */
export function soundForMove(m: { flags?: string; san?: string; promotion?: string }): SoundName {
  const san = m.san ?? ''
  if (san.endsWith('#')) return 'check'
  if (m.promotion || (m.flags ?? '').includes('p')) return 'promote'
  if (san.endsWith('+')) return 'check'
  if ((m.flags ?? '').match(/[kq]/)) return 'castle'
  if ((m.flags ?? '').match(/[ce]/)) return 'capture'
  return 'move'
}

export type Outcome = 'win' | 'loss' | 'draw' | 'aborted'

export function soundForOutcome(o: Outcome): SoundName | null {
  return o === 'win' ? 'win' : o === 'loss' ? 'loss' : o === 'draw' ? 'draw' : null
}
