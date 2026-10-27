#!/usr/bin/env node
/**
 * Measures the engine-free style axes of a player from PGN files, using the same definitions the
 * app uses for your own games. Use it to replace a reference profile in src/profile/players.ts
 * with real data:
 *
 *   node scripts/measure-players.mjs "Carlsen, Magnus" carlsen.pgn [more.pgn ...]
 *
 * The player name must match the PGN White/Black tag (any substring, case-insensitive).
 * Axes printed: attack, simplify, safety, endgame, open (0-10, 5 = typical). `sharpness` and `risk`
 * need engine evaluations, so analyse games in the app (or with Stockfish) to calibrate those two.
 * Use at least ~30 games for a stable read.
 */
import { readFileSync } from 'node:fs'
import { Chess } from 'chess.js'

const [, , name, ...files] = process.argv
if (!name || !files.length) { console.error('usage: measure-players.mjs "<player>" <file.pgn> [...]'); process.exit(1) }

const VALUE = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 }
const clamp = (x, lo = 0, hi = 1) => Math.max(lo, Math.min(hi, x))
const norm = (x, lo, hi) => clamp((x - lo) / (hi - lo))
const cheb = (a, b) => Math.max(Math.abs(a.charCodeAt(0) - b.charCodeAt(0)), Math.abs(Number(a[1]) - Number(b[1])))
const material = c => c.board().flat().reduce((t, s) => t + (s ? VALUE[s.type] : 0), 0)
const pieces = c => c.board().flat().filter(s => s && s.type !== 'p' && s.type !== 'k').length

const games = files.flatMap(f => readFileSync(f, 'utf8').split(/\n\s*\n(?=\[Event )/g)).map(s => s.trim()).filter(Boolean)
let moves = 0, captures = 0, checks = 0, pressure = 0, trades = 0, castledEarly = 0, castlePlies = [], endMoves = 0, openSum = 0, openN = 0, matSum = 0, used = 0
const lower = name.toLowerCase()

for (const text of games) {
  const white = /\[White "([^"]*)"\]/.exec(text)?.[1] ?? '', black = /\[Black "([^"]*)"\]/.exec(text)?.[1] ?? ''
  const color = white.toLowerCase().includes(lower) ? 'w' : black.toLowerCase().includes(lower) ? 'b' : null
  if (!color) continue
  const chess = new Chess()
  try { chess.loadPgn(text) } catch { continue }
  const history = chess.history({ verbose: true })
  if (history.length < 10) continue
  used++
  const replay = new Chess()
  let castled = 0, firstPawn = ''
  history.forEach((mv, i) => {
    if (mv.color === color) {
      moves++
      if (mv.captured) { captures++; const reply = history[i + 1]; if (reply?.captured && reply.to === mv.to) trades++ }
      if (mv.san.includes('+') || mv.san.includes('#')) checks++
      if ((mv.isKingsideCastle() || mv.isQueensideCastle()) && !castled) { castled = i + 1; castlePlies.push(i + 1); if (i + 1 <= 24) castledEarly++ }
      if (!firstPawn && mv.piece === 'p') firstPawn = mv.from + mv.to
      matSum += material(replay)
      if (pieces(replay) <= 6) endMoves++
    }
    replay.move(mv.san)
    if (mv.color === color && i >= 8 && mv.piece !== 'k') {
      const king = replay.board().flat().find(s => s && s.type === 'k' && s.color !== color)
      if (king && cheb(mv.to, king.square) <= 2) pressure++
    }
  })
  if (firstPawn) {
    const file = firstPawn[0]
    openSum += file === 'e' ? 1 : color === 'b' && firstPawn === 'c7c5' ? 0.9 : file === 'd' ? (color === 'w' ? 0.2 : 0.3) : file === 'c' ? 0.3 : 0.4
    openN++
  }
}
if (!used) { console.error(`No usable games for "${name}" in the given files.`); process.exit(1) }

const avgCastle = castlePlies.length ? castlePlies.reduce((a, b) => a + b, 0) / castlePlies.length : 26
const out = {
  attack: 10 * (0.4 * norm(captures / moves, 0.08, 0.30) + 0.3 * norm(checks / moves, 0.02, 0.14) + 0.3 * norm(pressure / moves, 0.08, 0.35)),
  simplify: 10 * (0.5 * norm(78 - matSum / moves, 14, 42) + 0.5 * norm(captures ? trades / captures : 0.5, 0.3, 0.8)),
  safety: 10 * (0.55 * (castledEarly / used) + 0.45 * norm(26 - avgCastle, 0, 16)),
  endgame: 10 * norm(endMoves / moves, 0.05, 0.35),
  open: openN ? 10 * (openSum / openN) : 5,
}
console.log(`${name}: ${used} games, ${moves} moves`)
for (const [k, v] of Object.entries(out)) console.log(`  ${k.padEnd(9)} ${v.toFixed(1)}`)
// Ready-to-paste axes in roster order (attack, sharpness, simplify, risk, safety, endgame, open).
// sharpness and risk need engine data, so they are left as 5 for you to keep from the existing entry.
const f = v => v.toFixed(1)
console.log(`  axes: [${f(out.attack)}, 5.0 /*sharpness: keep*/, ${f(out.simplify)}, 5.0 /*risk: keep*/, ${f(out.safety)}, ${f(out.endgame)}, ${f(out.open)}]`)
