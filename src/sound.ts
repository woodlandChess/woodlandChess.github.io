// ── Woodland sound ──────────────────────────────────────────────────────────
//
// A tiny synth - no audio files to ship - voiced like a heavy, expensive
// hardwood set on a thick solid board in a quiet study:
//   • a piece is SET DOWN, never clicked: a felt-cushioned contact (no bright
//     transient at all), the short ring of a heavy turned piece, the broad
//     "plate" resonances of a thick board, and a low thump that gives it mass
//   • everything is low-passed and sits in the low-mids (roughly 150-900 Hz),
//     which is what makes wood read as dense and heavy instead of light plastic
//   • captures are a firmer, lower strike with the captured piece set aside
//   • check is a muted mallet-bell; results are slow glockenspiel phrases
// A tight table-top room adds air without ringing; a gentle compressor glues it.
// Small random variation keeps repeated moves from sounding machine-gunned.
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
/**
 * `dry` / `send` feed the glued, reverberant mix used by bells and pads.
 * `wood` / `room` feed the wooden pieces: a separate path with only a transparent
 * peak limiter, so a hard strike really is louder than a soft one (the glue
 * compressor flattened them all to the same level) and a tight table-top room.
 */
interface Bus { dry: GainNode; send: GainNode; wood: GainNode; room: GainNode; noise: AudioBuffer }
let ctx: AudioContext | null = null
let bus: Bus | null = null

function createContext(): AudioContext | null {
  if (typeof window === 'undefined') return null
  const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!Ctor) return null
  try { return new Ctor() } catch { return null }
}

/** A dark room: exponentially decaying noise, smoothed so it stays warm. */
function roomImpulse(c: BaseAudioContext, seconds: number, power: number, smooth: number): AudioBuffer {
  const len = Math.floor(c.sampleRate * seconds)
  const buf = c.createBuffer(2, len, c.sampleRate)
  for (let ch = 0; ch < 2; ch++) {
    const data = buf.getChannelData(ch)
    let lp = 0
    for (let i = 0; i < len; i++) {
      const decay = Math.pow(1 - i / len, power)
      lp += ((Math.random() * 2 - 1) - lp) * smooth      // one-pole low-pass = warm tail
      data[i] = lp * decay
    }
  }
  return buf
}

/** Builds the whole mix graph on any audio context (live or offline). */
function buildBus(c: BaseAudioContext): Bus {
  const master = c.createGain()
  master.gain.value = 0.85
  const comp = c.createDynamicsCompressor()
  comp.threshold.value = -20
  comp.ratio.value = 3
  comp.attack.value = 0.006
  comp.release.value = 0.25
  master.connect(comp)
  comp.connect(c.destination)

  const dry = c.createGain()
  dry.connect(master)

  // long, warm library reverb - used by the bells
  const send = c.createGain()
  const verb = c.createConvolver()
  verb.buffer = roomImpulse(c, 0.9, 3.2, 0.22)
  const wet = c.createGain()
  wet.gain.value = 0.55
  send.connect(verb)
  verb.connect(wet)
  wet.connect(master)

  // wood: its own path to the output through a peak limiter only
  const limiter = c.createDynamicsCompressor()
  limiter.threshold.value = -7
  limiter.knee.value = 4
  limiter.ratio.value = 12
  limiter.attack.value = 0.002
  limiter.release.value = 0.09
  limiter.connect(c.destination)
  const wood = c.createGain()
  wood.gain.value = 0.7
  wood.connect(limiter)

  // tight, dark table-top room - so the wood has air but never rings
  const room = c.createGain()
  const roomVerb = c.createConvolver()
  roomVerb.buffer = roomImpulse(c, 0.24, 4.2, 0.16)
  const roomWet = c.createGain()
  roomWet.gain.value = 0.7
  room.connect(roomVerb)
  roomVerb.connect(roomWet)
  roomWet.connect(limiter)

  const noise = c.createBuffer(1, Math.floor(c.sampleRate * 0.6), c.sampleRate)
  const d = noise.getChannelData(0)
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1
  return { dry, send, wood, room, noise }
}

function ensure(): AudioContext | null {
  if (!ctx) {
    ctx = createContext()
    if (!ctx) return null
    bus = buildBus(ctx)
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
function wire(c: BaseAudioContext, node: AudioNode, wet: number) {
  node.connect(bus!.dry)
  if (wet > 0) {
    const s = c.createGain()
    s.gain.value = wet
    node.connect(s)
    s.connect(bus!.send)
  }
}

/** Wood goes to its own limited path plus the tight table-top room. */
function wireWood(c: BaseAudioContext, node: AudioNode, room: number) {
  node.connect(bus!.wood)
  const r = c.createGain()
  r.gain.value = room
  node.connect(r)
  r.connect(bus!.room)
}

/** A soft-mallet bell: fundamental plus two gentle partials, long smooth decay. */
function bell(c: BaseAudioContext, t: number, f: number, dur: number, peak: number, wet = 0.55) {
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
function pad(c: BaseAudioContext, t: number, f: number, dur: number, peak: number) {
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

// ── the wood ──────────────────────────────────────────────────────────────────
/**
 * One resonant mode of the wood: a damped sine with a soft (not instant) attack.
 * `twin` adds a second, very slightly detuned partner - real wooden modes are never
 * perfectly single, and the slow beating between the two is what stops a mode
 * sounding like a synthetic beep.
 */
function ring(c: BaseAudioContext, out: AudioNode, t: number, f: number, dur: number, peak: number, attack: number, twin = true) {
  const voices: Array<[number, number]> = twin ? [[1, 0.65], [1.0045, 0.35]] : [[1, 1]]
  for (const [detune, share] of voices) {
    const osc = c.createOscillator()
    osc.type = 'sine'
    osc.frequency.value = f * detune
    const g = c.createGain()
    g.gain.setValueAtTime(0.0001, t)
    g.gain.linearRampToValueAtTime(peak * share, t + attack)
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
    osc.connect(g); g.connect(out)
    osc.start(t)
    osc.stop(t + dur + 0.03)
  }
}

/** A cushioned burst of filtered noise: the felt and the grain of the wood at contact. */
function cushion(c: BaseAudioContext, out: AudioNode, t: number, type: BiquadFilterType, freq: number, q: number, attack: number, dur: number, peak: number) {
  const src = c.createBufferSource()
  src.buffer = bus!.noise
  const f = c.createBiquadFilter()
  f.type = type
  f.frequency.value = freq
  f.Q.value = q
  const g = c.createGain()
  g.gain.setValueAtTime(0.0001, t)
  g.gain.linearRampToValueAtTime(peak, t + attack)
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  src.connect(f); f.connect(g); g.connect(out)
  src.start(t, Math.random() * 0.4)
  src.stop(t + dur + 0.02)
}

/** The low, slightly falling thump of a heavy mass settling onto a thick board. */
function thump(c: BaseAudioContext, out: AudioNode, t: number, f0: number, f1: number, dur: number, peak: number) {
  const osc = c.createOscillator()
  osc.type = 'sine'
  osc.frequency.setValueAtTime(f0, t)
  osc.frequency.exponentialRampToValueAtTime(f1, t + dur * 0.6)
  const g = c.createGain()
  g.gain.setValueAtTime(0.0001, t)
  g.gain.linearRampToValueAtTime(peak, t + 0.003)
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  osc.connect(g); g.connect(out)
  osc.start(t)
  osc.stop(t + dur + 0.03)
}

/**
 * Resonances of a thick solid-wood board: [frequency Hz, decay s, level].
 * Low and broad, with the highest modes dying fastest - dense hardwood damps
 * brightness almost immediately, which is exactly why it sounds expensive.
 */
const BOARD_MODES: ReadonlyArray<readonly [number, number, number]> = [
  [150, 0.160, 0.15],
  [238, 0.155, 0.30],
  [352, 0.135, 0.42],
  [521, 0.110, 0.38],
  [764, 0.080, 0.22],
  [1120, 0.048, 0.10],
]

interface HitOpts { gain?: number; pitch?: number; hard?: number }

/**
 * A heavy wooden piece set down on a thick wooden board. All layers start on the
 * SAME instant (staggering them made one move sound like a double tap):
 *   felt + grain      -> a soft, dark contact; deliberately no bright click
 *   piece ring        -> the short note of a heavy turned hardwood piece
 *   board modes       -> the broad body of a thick plate
 *   thump             -> mass
 * `pitch` below 1 is heavier / lower; `hard` is how firmly it is struck.
 */
function woodHit(c: BaseAudioContext, t: number, { gain = 1, pitch = 1, hard = 1 }: HitOpts = {}) {
  const p = pitch * vary(0.035)
  const g = gain * vary(0.07)

  // Everything wooden passes one dark tone stage: harder strikes open it a little,
  // but it never gets bright. A touch of low shelf adds warmth.
  const out = c.createGain()
  const tone = c.createBiquadFilter()
  tone.type = 'lowpass'
  tone.frequency.value = Math.min(4300, 2700 + 900 * hard) * vary(0.05)
  tone.Q.value = 0.55
  const warm = c.createBiquadFilter()
  warm.type = 'lowshelf'
  warm.frequency.value = 260
  warm.gain.value = 3.5
  out.connect(tone); tone.connect(warm)
  wireWood(c, warm, 0.2)

  cushion(c, out, t, 'lowpass', 1300 * p, 0.6, 0.0028, 0.026, 0.10 * g * hard)
  cushion(c, out, t, 'bandpass', 600 * p, 1.0, 0.0018, 0.07, 0.22 * g * hard)

  ring(c, out, t, 455 * p, 0.105, 0.15 * g, 0.0012)
  ring(c, out, t, 1240 * p, 0.05, 0.055 * g * hard, 0.001, false)

  for (const [f, dur, level] of BOARD_MODES) ring(c, out, t, f * p, dur, level * g * 0.62, 0.0022, f < 400)

  thump(c, out, t, 96 * p, 68 * p, 0.15, 0.13 * g)
}

/** One piece set down. `weight` below 1 sounds heavier and lower (castling, captures). */
function place(c: BaseAudioContext, t: number, gain = 1, weight = 1) {
  woodHit(c, t, { gain: 0.9 * gain, pitch: weight })
}

const VOICES: Record<SoundName, (c: BaseAudioContext, t: number) => void> = {
  move: (c, t) => place(c, t),

  // A firmer, lower strike of heavy wood on the board; the captured piece is lifted
  // away and set down to the side a moment later (one soft, low, quiet tap).
  capture: (c, t) => {
    woodHit(c, t, { gain: 1.05, pitch: 0.9, hard: 1.3 })
    woodHit(c, t + 0.085, { gain: 0.24, pitch: 1.08, hard: 0.4 })
  },

  check: (c, t) => {
    place(c, t)
    bell(c, t + 0.07, 784, 1.1, 0.07)
    bell(c, t + 0.07, 1175, 0.7, 0.03)
  },

  // King first, then the rook: two distinct, heavy settles.
  castle: (c, t) => {
    place(c, t, 1, 0.92)
    place(c, t + 0.14, 0.88, 0.84)
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

  // A soft, low "thud" - corrective, never a buzzer. Wood, set down gently, twice.
  wrong: (c, t) => {
    woodHit(c, t, { gain: 0.46, pitch: 0.76, hard: 0.3 })
    woodHit(c, t + 0.095, { gain: 0.3, pitch: 0.7, hard: 0.25 })
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

/**
 * Renders one sound to a mono sample buffer without playing it - for previews and
 * automated checks. Never used by the app itself, so bundlers drop it.
 */
export async function renderSoundOffline(name: SoundName, seconds = 1, sampleRate = 44100): Promise<Float32Array> {
  const oc = new OfflineAudioContext(2, Math.floor(sampleRate * seconds), sampleRate)
  const saved = bus
  bus = buildBus(oc)
  try {
    VOICES[name](oc, 0.02)
    return (await oc.startRendering()).getChannelData(0)
  } finally {
    bus = saved
  }
}
