import { schools, type ChessSchool } from '../stockfish'
import { openingFamily } from './openings'
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
}

export interface StyleSummary {
  school: ChessSchool | null
  label: string
  players: string
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
}

const clamp = (x: number, lo = 0, hi = 1) => Math.max(lo, Math.min(hi, x))
const norm = (x: number, lo: number, hi: number) => clamp((x - lo) / (hi - lo))
const avg = (t: Tally) => (t.n ? t.sum / t.n : null)
const sumTally = (xs: Tally[]): Tally => xs.reduce((a, t) => ({ sum: a.sum + t.sum, n: a.n + t.n }), { sum: 0, n: 0 })

export function metricsOf(reviews: GameReview[]): StyleMetrics | null {
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

/** Share of the school's opening moves (for your colour) that you actually played in your first three moves. */
function repertoireOverlap(school: ChessSchool, games: ProfileGame[], reviews: GameReview[]): number {
  const byId = new Map(games.map(g => [g.id, g]))
  let total = 0, count = 0
  for (const r of reviews) {
    const g = byId.get(r.gameId)
    if (!g) continue
    const first = new Set(r.features.firstMoves)
    for (const line of schools[school].book) {
      const moves = line.split(' ').filter((_, i) => (i % 2 === 0) === (g.userColor === 'w'))
      if (!moves.length) continue
      total += moves.filter(mv => first.has(mv)).length / Math.min(3, moves.length)
      count++
    }
  }
  return count ? total / count : 0
}

/** How quickly a match falls off with distance (axis points): 1 point away ~93%, 3 ~51%, 5 ~16%. */
const MATCH_SPREAD = 2.6

export function matchSchools(axes: Axes, games: ProfileGame[], reviews: GameReview[]): SchoolMatch[] {
  return (Object.keys(schools) as ChessSchool[]).map(school => {
    const w = schools[school].weights
    const d = Math.hypot(axes.attack - w.attack, axes.focus - w.focus, axes.defend - w.defend)
    // Opening choices are a recognised style signal; they nudge, never decide (at most 1 point of distance).
    const adjusted = Math.max(0, d - repertoireOverlap(school, games, reviews))
    return { school, label: schools[school].label, match: Math.round(100 * Math.exp(-(adjusted ** 2) / (2 * MATCH_SPREAD ** 2))), ...FAMOUS[school] }
  }).sort((a, b) => b.match - a.match)
}

export function summarizeStyle(games: ProfileGame[], reviews: GameReview[]): StyleSummary {
  const metrics = metricsOf(reviews)
  const base = { games: games.length, analyzed: reviews.length, moves: metrics?.moves ?? 0 }
  if (!metrics) {
    return { school: null, label: 'Still taking shape', players: '', why: '', axes: { attack: 5, focus: 5, defend: 5 },
      matches: [], strengths: [], focus: 'Analyze a few games to see how you play.', confidence: 'Early read', metrics: null, ...base }
  }
  const axes = axesOf(metrics)
  const matches = matchSchools(axes, games, reviews)
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
    school: top.school, label: top.label, players: top.players, why: top.why, axes, matches,
    strengths: strengths.slice(0, 3), focus: tips[0]?.title ?? 'Keep building a representative game sample',
    confidence: metrics.moves < 60 ? 'Early read' : metrics.moves < 250 ? 'Developing' : 'Established', metrics, ...base,
  }
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
