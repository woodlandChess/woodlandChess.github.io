import { schools, type ChessSchool } from '../stockfish'
import { openingFamily } from './openings'
import { AXES, PLAYERS, playerVector, type Axis, type PlayerRef, type StyleVector } from './players'
import type { GameReview, ProfileGame, Tally } from './store'

/**
 * Style read: three measured axes (the same Attack / Focus / Defend scale the
 * computer's playing schools use) are compared with each school's own weights,
 * and each school is tied to the player it is most associated with.
 * Everything here is an estimate from a small sample and is labelled as such.
 */

export interface Axes { attack: number; focus: number; defend: number }

/** The player (or players) each school is named for, with the reason in a few words. */
export const FAMOUS: Record<ChessSchool, { players: string; why: string }> = {
  Attacking:          { players: 'Mikhail Tal',          why: 'sacrificial attacks and the initiative' },
  Dynamic:            { players: 'Garry Kasparov',       why: 'active pieces and relentless pressure' },
  Positional:         { players: 'José Raúl Capablanca', why: 'clear structure and endgame technique' },
  Defensive:          { players: 'Tigran Petrosian',     why: 'prophylaxis and solid defence' },
  Soviet:             { players: 'Mikhail Botvinnik',    why: 'rigorous preparation and balanced calculation' },
  British:            { players: 'Michael Adams',        why: 'practical, resilient play and sound endgames' },
  Hungarian:          { players: 'Lajos Portisch',       why: 'solid structures and restrained risk' },
  'Classical German': { players: 'Siegbert Tarrasch',    why: 'central control and fast development' },
  American:           { players: 'Bobby Fischer',        why: 'objective calculation and precise conversion' },
  Universal:          { players: 'Magnus Carlsen',       why: 'adapting to any position and grinding small edges' },
}

export interface SchoolMatch { school: ChessSchool; label: string; match: number; players: string; why: string }

export interface StyleMetrics {
  moves: number
  accuracy: number
  captureRate: number
  checkRate: number
  pressureRate: number
  sacrificesPer100: number
  tradeRate: number
  castledShare: number
  worseAccuracy: number | null
  betterAccuracy: number | null
  phaseAccuracy: Partial<Record<'Opening' | 'Middlegame' | 'Endgame', number>>
  squandered: number
  games: number
  /** Share of your positions where only one move held up, and how many of those you solved. */
  criticalShare: number
  criticalN: number
  criticalSolved: number | null
  meanGap: number
  /** Average material on the board at your moves (starting position = 78). */
  avgMaterial: number
  avgCastlePly: number
  endgameShare: number
  endgameEdge: number
  openShare: number
  tacticalErrors: number
  quietErrors: number
}

export interface StyleSummary {
  school: ChessSchool | null
  label: string
  /** The player the closest school is named for (school scale). */
  schoolPlayer: string
  why: string
  axes: Axes
  matches: SchoolMatch[]
  strengths: string[]
  focus: string
  games: number
  analyzed: number
  moves: number
  confidence: 'Early read' | 'Developing' | 'Established'
  metrics: StyleMetrics | null
  /** Seven-axis fingerprint and the closest players (best first). */
  fingerprint: StyleVector | null
  players: PlayerMatch[]
  tactics: TacticsReport | null
}

const clamp = (x: number, lo = 0, hi = 1) => Math.max(lo, Math.min(hi, x))
const norm = (x: number, lo: number, hi: number) => clamp((x - lo) / (hi - lo))
const avg = (t: Tally) => (t.n ? t.sum / t.n : null)
const sumTally = (xs: Tally[]): Tally => xs.reduce((a, t) => ({ sum: a.sum + t.sum, n: a.n + t.n }), { sum: 0, n: 0 })

export function metricsOf(all: GameReview[], games: ProfileGame[] = []): StyleMetrics | null {
  const reviews = all.filter(r => r && r.features)
  const f = reviews.map(r => r.features)
  const moves = f.reduce((n, x) => n + x.moves, 0)
  if (!moves) return null
  const captures = f.reduce((n, x) => n + x.captures, 0)
  const phase = (p: 'Opening' | 'Middlegame' | 'Endgame') => { const t = sumTally(f.map(x => x.byPhase[p])); return t.n >= 8 ? Math.round(t.sum / t.n) : undefined }
  const worse = avg(sumTally(f.map(x => x.worse)))
  const better = avg(sumTally(f.map(x => x.better)))
  const nWorse = sumTally(f.map(x => x.worse)).n, nBetter = sumTally(f.map(x => x.better)).n
  return {
    moves, games: reviews.length,
    accuracy: Math.round(reviews.reduce((s, r) => s + r.accuracy, 0) / reviews.length),
    captureRate: captures / moves,
    checkRate: f.reduce((n, x) => n + x.checks, 0) / moves,
    pressureRate: f.reduce((n, x) => n + x.pressure, 0) / moves,
    sacrificesPer100: (f.reduce((n, x) => n + x.sacrifices, 0) / moves) * 100,
    tradeRate: captures ? f.reduce((n, x) => n + x.trades, 0) / captures : 0.5,
    castledShare: f.filter(x => x.castledPly > 0 && x.castledPly <= 24).length / f.length,
    worseAccuracy: worse !== null && nWorse >= 8 ? worse : null,
    betterAccuracy: better !== null && nBetter >= 8 ? better : null,
    phaseAccuracy: { Opening: phase('Opening'), Middlegame: phase('Middlegame'), Endgame: phase('Endgame') },
    squandered: f.filter(x => x.squandered).length,
    ...extraMetrics(reviews, moves, games),
  }
}

/** First pawn push -> how "open" the player's games start: e-pawn and ...c5 are open, d/c-pawn and flank moves closed. */
export function openness(firstPawn: string, color: 'w' | 'b'): number | null {
  if (!firstPawn) return null
  const file = firstPawn[0], from = firstPawn[1], to = firstPawn[3]
  if (file === 'e') return 1
  if (color === 'b' && file === 'c' && from === '7' && to === '5') return 0.9     // Sicilian-type
  if (file === 'd') return color === 'w' ? 0.2 : 0.3
  if (file === 'c') return 0.3
  return 0.4                                                                      // flank pawn moves
}

function openShareOf(reviews: GameReview[], games: ProfileGame[]): number {
  const color = new Map(games.map(g => [g.id, g.userColor]))
  const v = reviews.map(r => openness(r.features.firstPawn, color.get(r.gameId) ?? 'w')).filter((x): x is number => x !== null)
  return v.length ? v.reduce((a, b) => a + b, 0) / v.length : 0.5
}

function extraMetrics(reviews: GameReview[], moves: number, games: ProfileGame[]) {
  const f = reviews.map(r => r.features)
  const gap = sumTally(f.map(x => x.gap)), mat = sumTally(f.map(x => x.material))
  const critN = f.reduce((n, x) => n + x.critical.n, 0), critFound = f.reduce((n, x) => n + x.critical.found, 0)
  const castles = f.map(x => x.castledPly).filter(p => p > 0)
  const endMoves = f.reduce((n, x) => n + x.byPhase.Endgame.n, 0)
  const endAcc = sumTally(f.map(x => x.byPhase.Endgame)), all = sumTally(f.flatMap(x => Object.values(x.byPhase)))
  const edge = endAcc.n >= 8 && all.n ? endAcc.sum / endAcc.n - all.sum / all.n : 0
  return {
    criticalShare: gap.n ? critN / gap.n : 0.14, criticalN: critN,
    criticalSolved: critN >= 4 ? critFound / critN : null,
    meanGap: gap.n ? gap.sum / gap.n : 8,
    avgMaterial: mat.n ? mat.sum / mat.n : 52,
    avgCastlePly: castles.length ? castles.reduce((a, b) => a + b, 0) / castles.length : 26,
    endgameShare: moves ? endMoves / moves : 0.15, endgameEdge: edge,
    openShare: openShareOf(reviews, games),
    tacticalErrors: f.reduce((n, x) => n + x.tacticalErrors, 0),
    quietErrors: f.reduce((n, x) => n + x.quietErrors, 0),
  }
}

/**
 * Axes on the schools' 0-10 scale.
 *   Attack - captures, checks, pressure near the enemy king, sound sacrifices
 *   Focus  - precision overall, in the opening, and in converting an advantage
 *   Defend - accuracy when worse, willingness to trade, early castling, quiet play
 * With few moves the read is pulled toward the neutral middle (5) instead of overreacting.
 */
export function axesOf(m: StyleMetrics): Axes {
  const quiet = 1 - clamp(m.captureRate + m.checkRate, 0, 1)
  const attack = 10 * (0.35 * norm(m.captureRate, 0.08, 0.30) + 0.25 * norm(m.checkRate, 0.02, 0.14)
    + 0.25 * norm(m.pressureRate, 0.08, 0.35) + 0.15 * norm(m.sacrificesPer100, 0, 3))
  const focus = 10 * (0.4 * norm(m.accuracy, 40, 90) + 0.3 * norm(m.betterAccuracy ?? m.accuracy, 40, 95)
    + 0.3 * norm(m.phaseAccuracy.Opening ?? m.accuracy, 40, 95))
  const defend = 10 * (0.4 * norm(m.worseAccuracy ?? m.accuracy, 30, 85) + 0.2 * norm(m.tradeRate, 0.3, 0.8)
    + 0.2 * m.castledShare + 0.2 * norm(quiet, 0.6, 0.85))
  const trust = Math.min(1, m.moves / 150)
  const shrink = (v: number) => Math.round((5 + (v - 5) * trust) * 10) / 10
  return { attack: shrink(attack), focus: shrink(focus), defend: shrink(defend) }
}

/**
 * The school ranking comes from the player ranking, so the two can never disagree: a school's score is
 * its best-matching player's score, and the closest school is the closest player's school.
 */
export function schoolsFromPlayers(players: PlayerMatch[]): SchoolMatch[] {
  const best = new Map<ChessSchool, PlayerMatch>()
  for (const m of players) if (!best.has(m.player.school) || m.match > best.get(m.player.school)!.match) best.set(m.player.school, m)
  return [...best.entries()].map(([school, m]) => ({
    school, label: schools[school].label, match: m.match, players: m.player.name, why: FAMOUS[school].why,
  })).sort((a, b) => b.match - a.match)
}

export function summarizeStyle(games: ProfileGame[], reviews: GameReview[]): StyleSummary {
  const metrics = metricsOf(reviews, games)
  const base = { games: games.length, analyzed: reviews.length, moves: metrics?.moves ?? 0 }
  if (!metrics) {
    return { school: null, label: 'Still taking shape', schoolPlayer: '', why: '', axes: { attack: 5, focus: 5, defend: 5 },
      matches: [], strengths: [], focus: 'Analyze a few games to see how you play.', confidence: 'Early read', metrics: null,
      fingerprint: null, players: [], tactics: null, ...base }
  }
  const axes = axesOf(metrics)
  const fingerprint = styleAxes(metrics)
  const players = matchPlayers(fingerprint, PLAYERS, { moves: metrics.moves })
  const matches = schoolsFromPlayers(players)
  const top = matches[0]
  const strengths: string[] = []
  if (metrics.accuracy >= 80) strengths.push(`Consistent move quality (${metrics.accuracy}% average accuracy)`)
  else if (metrics.accuracy >= 65) strengths.push(`Solid accuracy overall (${metrics.accuracy}%)`)
  const bestPhase = Object.entries(metrics.phaseAccuracy).filter(([, v]) => v !== undefined).sort((a, b) => (b[1] as number) - (a[1] as number))[0]
  if (bestPhase) strengths.push(`Strongest in the ${bestPhase[0].toLowerCase()} (${bestPhase[1]}% accuracy)`)
  if (metrics.betterAccuracy !== null && metrics.betterAccuracy >= 80) strengths.push('Converts good positions accurately')
  if (metrics.worseAccuracy !== null && metrics.worseAccuracy >= 70) strengths.push('Defends well when worse')
  if (axes.attack >= 6.5) strengths.push('Creates pressure near the enemy king')
  if (!strengths.length) strengths.push('Keep building a sample: the read sharpens with more games')
  const tips = makeTips(games, reviews, metrics)
  return {
    school: top.school, label: top.label, schoolPlayer: players[0].player.name, why: players[0].player.known, axes, matches,
    strengths: strengths.slice(0, 3), focus: tips[0]?.title ?? 'Keep building a representative game sample',
    confidence: metrics.moves < 60 ? 'Early read' : metrics.moves < 250 ? 'Developing' : 'Established', metrics,
    fingerprint, players, tactics: tacticsReport(metrics), ...base,
  }
}

// ── Style fingerprint and the closest players ───────────────────────────────

const MIN_SHRINK = 150

/**
 * Seven style axes on the same 0-10 scale as the reference roster. Skill is left out on purpose:
 * accuracy tells you how well you play, not how. With few moves the read is pulled toward 5.
 */
export function styleAxes(m: StyleMetrics): StyleVector {
  const raw: StyleVector = {
    attack: 10 * (0.35 * norm(m.captureRate, 0.08, 0.30) + 0.25 * norm(m.checkRate, 0.02, 0.14)
      + 0.25 * norm(m.pressureRate, 0.08, 0.35) + 0.15 * norm(m.sacrificesPer100, 0, 3)),
    sharpness: 10 * (0.6 * norm(m.criticalShare, 0.05, 0.28) + 0.4 * norm(m.meanGap, 3, 13)),
    simplify: 10 * (0.5 * norm(78 - m.avgMaterial, 14, 42) + 0.5 * norm(m.tradeRate, 0.3, 0.8)),
    risk: 10 * (0.75 * norm(m.sacrificesPer100, 0, 2) + 0.25 * (1 - m.castledShare)),
    safety: 10 * (0.55 * m.castledShare + 0.45 * norm(26 - m.avgCastlePly, 0, 16)),
    endgame: 10 * (0.5 * norm(m.endgameShare, 0.05, 0.35) + 0.5 * norm(m.endgameEdge, -12, 12)),
    open: 10 * m.openShare,
  }
  const trust = Math.min(1, m.moves / MIN_SHRINK)
  const out = {} as StyleVector
  for (const a of AXES) out[a] = Math.round((5 + (raw[a] - 5) * trust) * 10) / 10
  return out
}

/** Base importance of each axis. Opening choice is the least reliable signal, attack the most. */
const AXIS_WEIGHT: Record<Axis, number> = { attack: 1.2, sharpness: 1.0, simplify: 1.0, risk: 1.0, safety: 0.8, endgame: 0.7, open: 0.5 }
/**
 * Match falls off with distance: 1 axis-point apart ~87%, 2 ~58%, 3 ~29%, 4 ~11% (with plenty of data).
 * Tighter than a small roster would need: with 200+ players someone is always close, so a loose
 * falloff would hand out near-100% matches to everyone.
 */
const PLAYER_SPREAD = 1.9

export interface MatchOptions {
  /** Moves the fingerprint is based on. Fewer moves means a less certain read, so matches are softer. */
  moves?: number
}

export interface PlayerMatch {
  player: PlayerRef
  /** 0-100 */
  match: number
  /** Weighted root-mean-square distance in axis points (0 = identical). */
  distance: number
  /** The axes where you and this player are closest, and the one where you differ most. */
  alike: Axis[]
  differs: Axis
  vector: StyleVector
}

const weightCache = new WeakMap<PlayerRef[], Record<Axis, number>>()

/**
 * Axis weights for a roster: the base weights, scaled by how well the axis separates the roster's
 * players (an axis where everyone scores alike says little about who you resemble, so it counts
 * less; one that spreads players out counts more). The adjustment is bounded so no axis dominates.
 */
export function axisWeights(roster: PlayerRef[] = PLAYERS): Record<Axis, number> {
  const cached = weightCache.get(roster)
  if (cached) return cached
  const vectors = roster.map(playerVector)
  const sd = {} as Record<Axis, number>
  for (const a of AXES) {
    const mean = vectors.reduce((t, v) => t + v[a], 0) / (vectors.length || 1)
    sd[a] = Math.sqrt(vectors.reduce((t, v) => t + (v[a] - mean) ** 2, 0) / (vectors.length || 1))
  }
  const meanSd = AXES.reduce((t, a) => t + sd[a], 0) / AXES.length
  const out = {} as Record<Axis, number>
  for (const a of AXES) out[a] = AXIS_WEIGHT[a] * (sd[a] > 0 ? clamp(meanSd / sd[a], 0.7, 1.4) : 1)
  weightCache.set(roster, out)
  return out
}

export function distance(a: StyleVector, b: StyleVector, weights: Record<Axis, number> = AXIS_WEIGHT): number {
  let sum = 0, w = 0
  for (const k of AXES) { sum += weights[k] * (a[k] - b[k]) ** 2; w += weights[k] }
  return Math.sqrt(sum / w)
}

/** Ranks every player in the roster by how close their style is to yours. */
export function matchPlayers(you: StyleVector, roster: PlayerRef[] = PLAYERS, opts: MatchOptions = {}): PlayerMatch[] {
  const weights = axisWeights(roster)
  const trust = opts.moves === undefined ? 1 : Math.min(1, Math.max(0, opts.moves) / MIN_SHRINK)
  const spread = PLAYER_SPREAD * (1 + 0.5 * (1 - trust))
  return roster.map(player => {
    const vector = playerVector(player)
    const d = distance(you, vector, weights)
    const diffs = AXES.map(k => [k, Math.abs(you[k] - vector[k])] as const)
    const strong = diffs.filter(([k]) => Math.abs(you[k] - 5) >= 1.2 && Math.abs(vector[k] - 5) >= 1.2 && Math.sign(you[k] - 5) === Math.sign(vector[k] - 5))
    const alike = (strong.length ? strong : diffs).sort((a, b) => a[1] - b[1]).slice(0, 2).map(([k]) => k)
    const differs = [...diffs].sort((a, b) => b[1] - a[1])[0][0]
    return { player, match: Math.round(100 * Math.exp(-(d ** 2) / (2 * spread ** 2))), distance: d, alike, differs, vector }
  }).sort((a, b) => b.match - a.match || a.distance - b.distance || a.player.name.localeCompare(b.player.name))
}

export interface TacticsReport {
  criticalN: number
  criticalSolved: number | null
  tacticalErrors: number
  quietErrors: number
  /** Which kind of mistake dominates, when there are enough to say. */
  lean: 'tactics' | 'strategy' | 'balanced' | null
}

export function tacticsReport(m: StyleMetrics | null): TacticsReport | null {
  if (!m) return null
  const total = m.tacticalErrors + m.quietErrors
  const lean = total < 5 ? null : m.tacticalErrors / total >= 0.6 ? 'tactics' : m.quietErrors / total >= 0.6 ? 'strategy' : 'balanced'
  return { criticalN: m.criticalN, criticalSolved: m.criticalSolved, tacticalErrors: m.tacticalErrors, quietErrors: m.quietErrors, lean }
}

// ── Advice ────────────────────────────────────────────────────────────────────

export interface PlayerTip { title: string; body: string; evidence?: boolean }

/**
 * Five things to work on. Each data-driven tip states the numbers behind it and
 * only appears when there is enough evidence; general habits fill the rest and
 * are marked as such.
 */
export function makeTips(games: ProfileGame[], reviews: GameReview[], metrics = metricsOf(reviews)): PlayerTip[] {
  const tips: (PlayerTip & { weight: number })[] = []
  const byId = new Map(games.map(g => [g.id, g]))
  const mine = reviews.flatMap(r => {
    const user = byId.get(r.gameId)?.userColor
    return r.plies.filter(p => p.color === user)
  })
  if (metrics && mine.length >= 20) {
    const phases = Object.entries(metrics.phaseAccuracy).filter(([, v]) => v !== undefined) as ['Opening' | 'Middlegame' | 'Endgame', number][]
    const weakest = phases.sort((a, b) => a[1] - b[1])[0]
    if (weakest && metrics.accuracy - weakest[1] >= 4) {
      const advice = {
        Opening: 'Learn the first ten moves of one opening per colour, and check king safety before grabbing pawns.',
        Middlegame: 'Before each move, name the opponent\'s best threat, then compare two candidate moves.',
        Endgame: 'Practice king activity and pawn races; count moves before trading into a pawn ending.',
      }[weakest[0]]
      tips.push({ title: `Strengthen your ${weakest[0].toLowerCase()}`, weight: metrics.accuracy - weakest[1], evidence: true,
        body: `Your ${weakest[0].toLowerCase()} accuracy is ${weakest[1]}% against ${metrics.accuracy}% overall. ${advice}` })
    }
    const blunders = mine.filter(p => p.grade === 'Blunder')
    const per100 = (blunders.length / mine.length) * 100
    if (blunders.length >= 2 && per100 >= 2) {
      const when = (['Opening', 'Middlegame', 'Endgame'] as const).map(ph => [ph, blunders.filter(b => b.phase === ph).length] as const).sort((a, b) => b[1] - a[1])[0]
      tips.push({ title: 'Do a blunder check', weight: per100 * 3, evidence: true,
        body: `${blunders.length} blunders in ${mine.length} moves (${per100.toFixed(1)} per 100), most in the ${when[0].toLowerCase()}. Before moving, check what your move leaves undefended and every check, capture and threat reply.` })
    }
    const costly = mine.filter(p => p.winLoss >= 5)
    const captureCostly = costly.filter(p => p.tags.includes('Capture')).length
    if (costly.length >= 5 && captureCostly / costly.length >= 0.35) {
      tips.push({ title: 'Verify every exchange', weight: 12, evidence: true,
        body: `${captureCostly} of your ${costly.length} costly moves were captures. Before taking, look at the recapture and at what the capture leaves loose.` })
    }
  }
  if (metrics) {
    const errors = metrics.tacticalErrors + metrics.quietErrors
    if (metrics.tacticalErrors >= 3 && metrics.tacticalErrors / errors >= 0.55) {
      tips.push({ title: 'Train tactics', weight: 14, evidence: true,
        body: `${metrics.tacticalErrors} of your ${errors} costly moves missed a capture, check or mate that the engine saw. Solve a few tactical puzzles daily, and before each move look at every check, capture and threat.` })
    } else if (metrics.quietErrors >= 3 && metrics.quietErrors / errors >= 0.55) {
      tips.push({ title: 'Improve positional judgement', weight: 14, evidence: true,
        body: `${metrics.quietErrors} of your ${errors} costly moves were quiet-move errors: the engine's choice was a plan or a piece placement, not a tactic. Study pawn structure, piece activity and typical plans for your openings.` })
    }
    if (metrics.criticalSolved !== null && metrics.criticalSolved < 0.45) {
      tips.push({ title: 'Find the only move', weight: 13, evidence: true,
        body: `In ${metrics.criticalN} positions where only one move held up, you found it ${Math.round(metrics.criticalSolved * 100)}% of the time. In sharp positions list every forcing reply before choosing.` })
    }
    if (metrics.squandered >= 1 && metrics.games >= 3) {
      tips.push({ title: 'Convert winning positions', weight: 10 + metrics.squandered * 4, evidence: true,
        body: `You were clearly winning in ${metrics.squandered} of ${metrics.games} games and let it slip. When ahead: trade pieces, remove counterplay, and avoid new complications.` })
    }
    if (metrics.worseAccuracy !== null && metrics.betterAccuracy !== null && metrics.betterAccuracy - metrics.worseAccuracy >= 12) {
      tips.push({ title: 'Stay accurate when worse', weight: metrics.betterAccuracy - metrics.worseAccuracy, evidence: true,
        body: `Your accuracy falls from ${Math.round(metrics.betterAccuracy)}% when better to ${Math.round(metrics.worseAccuracy)}% when worse. In bad positions, look for the most resilient move and for forcing counter-chances instead of hoping.` })
    }
    if (metrics.games >= 4 && metrics.castledShare < 0.5) {
      tips.push({ title: 'Castle earlier', weight: 9, evidence: true,
        body: `You castled by move 12 in only ${Math.round(metrics.castledShare * 100)}% of ${metrics.games} games. An uncastled king is the commonest target; finish development and castle unless there is a concrete reason not to.` })
    }
  }
  // Repertoire: the opening you rely on most, with its record.
  const families = new Map<string, { n: number; w: number; d: number; l: number }>()
  for (const r of reviews) {
    const g = byId.get(r.gameId)
    if (!g || r.opening === 'Unclassified opening') continue
    const k = openingFamily(r.opening)
    const e = families.get(k) ?? { n: 0, w: 0, d: 0, l: 0 }
    e.n++; if (g.result === 'win') e.w++; else if (g.result === 'draw') e.d++; else if (g.result === 'loss') e.l++
    families.set(k, e)
  }
  const top = [...families.entries()].sort((a, b) => b[1].n - a[1].n)[0]
  if (top && top[1].n >= 3) {
    tips.push({ title: `Your main opening: ${top[0]}`, weight: 5, evidence: true,
      body: `You reached it in ${top[1].n} games (${top[1].w} won, ${top[1].d} drawn, ${top[1].l} lost). Learn its main plan and the two or three most common replies so you are never surprised early.` })
  }
  const ranked: PlayerTip[] = tips.sort((a, b) => b.weight - a.weight).slice(0, 5).map(({ title, body, evidence }) => ({ title, body, evidence }))
  const general: PlayerTip[] = [
    { title: 'Compare two candidate moves', body: 'General habit: for each important move, name a second option and the opponent\'s best reply to both.' },
    { title: 'Check loose pieces', body: 'General habit: before moving, find any piece attacked more times than it is defended, on either side.' },
    { title: 'Review one loss after every game', body: 'General habit: replay the first move that cost you winning chances and write down what you missed.' },
    { title: 'Look for forcing moves first', body: 'General habit: scan checks, captures and threats for both sides before quiet moves.' },
    { title: 'Activate your king in endgames', body: 'General habit: once queens are off, bring the king toward the centre.' },
  ]
  for (const g of general) if (ranked.length < 5) ranked.push(g)
  return ranked
}
