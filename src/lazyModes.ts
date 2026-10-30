import { lazy } from 'react'
import type { ModeId } from './routes'

/**
 * Screens (and their CSS) are loaded when they are first needed, not up front.
 *
 * Each dynamic import below becomes its own JavaScript chunk AND its own CSS file
 * (Vite emits the css a chunk imports next to it and waits for it before the
 * chunk resolves), so the first paint only pays for the menu screens. Intent
 * hints (hovering/touching a mode button, idle time after the first paint)
 * start the download early so a tap rarely waits.
 */
const loadGameScreen = () => import('./components/GameScreen')
const loadGameResult = () => import('./components/GameResultDialog')
const loadOnline = () => import('./OnlinePlay')
const loadPuzzle = () => import('./puzzle/PuzzleMode')
const loadProfile = () => import('./profile/PlayerProfile')
const loadLearn = () => import('./learn/LearnPage')

export const GameScreen = lazy(() => loadGameScreen().then(m => ({ default: m.GameScreen })))
export const GameResultDialog = lazy(() => loadGameResult().then(m => ({ default: m.GameResultDialog })))
export const OnlinePlay = lazy(() => loadOnline().then(m => ({ default: m.OnlinePlay })))
export const PuzzleMode = lazy(() => loadPuzzle().then(m => ({ default: m.PuzzleMode })))
export const PlayerProfile = lazy(() => loadProfile().then(m => ({ default: m.PlayerProfile })))
export const LearnPage = lazy(() => loadLearn().then(m => ({ default: m.LearnPage })))

const started = new Set<string>()
const once = (key: string, load: () => Promise<unknown>) => {
  if (started.has(key)) return
  started.add(key)
  load().catch(() => started.delete(key))      // offline / flaky: try again on the next hint
}

/** The computer game screen: what "Begin game" needs next. */
export const preloadGame = () => { once('game', loadGameScreen); once('result', loadGameResult) }

/** Warm the chunk behind a tab when the player shows intent (Home is already loaded). */
export function preloadMode(mode: ModeId) {
  if (mode === 'ai') preloadGame()
  else if (mode === 'online') once('online', loadOnline)
  else if (mode === 'puzzle') once('puzzle', loadPuzzle)
  else if (mode === 'profile') once('profile', loadProfile)
  else if (mode === 'learn') once('learn', loadLearn)
}

/** After the first paint, fetch the game screen in idle time (the common next step). */
export function warmUpWhenIdle() {
  const run = () => preloadGame()
  const idle = (window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number }).requestIdleCallback
  if (idle) idle(run, { timeout: 3000 })
  else window.setTimeout(run, 1500)
}
