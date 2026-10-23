import { useEffect, useMemo, useRef, useState } from 'react'
import { StockfishClient } from '../stockfish'
import { HomeFrame } from '../components/HomeFrame'
import { Segmented, WeightBar } from '../components/Controls'
import type { ModeId } from '../components/ModeNav'
import { getStoredToken, LichessClient } from '../lichess'
import { parseLichessNdjson, reviewGame } from './analysis'
import { readProfile, saveProfile, type GameReview, type PlayerProfileData, type ProfileGame } from './store'
import { makeTips, summarizeStyle } from './style'
import { GameStudy } from './GameStudy'
import '../styles/profile.css'

const MAX_PER_RUN = 30
const COUNTS = ['5', '10', '20', '50'] as const
type Count = (typeof COUNTS)[number]
const SHOWN = 8

interface Progress { game: number; of: number; done: number; total: number }

/** Merges new games in, dropping Lichess games that belong to a different account. */
function mergeGames(existing: ProfileGame[], incoming: ProfileGame[], username: string, previous: string): ProfileGame[] {
  const sameAccount = !previous || previous.toLowerCase() === username.toLowerCase()
  const kept = existing.filter(g => g.source === 'ai' || sameAccount)
  const byId = new Map<string, ProfileGame>()
  for (const g of [...kept, ...incoming]) byId.set(g.id, g)
  return [...byId.values()].sort((a, b) => b.playedAt - a.playedAt)
}

const resultLabel = { win: 'Won', loss: 'Lost', draw: 'Drew', unknown: '—' } as const

export function PlayerProfile({ onNavigate }: { onBack?: () => void; onNavigate: (m: ModeId) => void }) {
  const [data, setData] = useState<PlayerProfileData>(readProfile)
  const dataRef = useRef(data)
  const [username, setUsername] = useState(data.username)
  const [count, setCount] = useState<Count>('10')
  const [busy, setBusy] = useState(false)
  const [status, setStatus] = useState('')
  const [progress, setProgress] = useState<Progress | null>(null)
  const [error, setError] = useState('')
  const [connected, setConnected] = useState('')
  const [open, setOpen] = useState<{ game: ProfileGame; review: GameReview } | null>(null)
  const [showAll, setShowAll] = useState(false)
  const runRef = useRef<AbortController | null>(null)

  const commit = (next: PlayerProfileData) => { dataRef.current = next; setData(next); saveProfile(next) }
  const summary = useMemo(() => summarizeStyle(data.games, data.reviews), [data])
  const tips = useMemo(() => makeTips(data.games, data.reviews), [data])
  const reviewOf = useMemo(() => new Map(data.reviews.map(r => [r.gameId, r])), [data.reviews])
  const pending = data.games.filter(g => !reviewOf.has(g.id)).length

  useEffect(() => {
    let active = true
    const token = getStoredToken()
    if (token) new LichessClient(token.access_token).getProfile().then(p => {
      if (!active) return
      setConnected(p.username); setUsername(p.username)
    }).catch(() => { /* disconnected or expired: keep manual entry */ })
    return () => { active = false; runRef.current?.abort() }
  }, [])

  async function analyze(games: ProfileGame[]) {
    runRef.current?.abort()
    const controller = new AbortController()
    runRef.current = controller
    setBusy(true); setError('')
    const engine = new StockfishClient()
    try {
      const known = new Set(dataRef.current.reviews.map(r => r.gameId))
      const batch = games.filter(g => !known.has(g.id)).slice(0, MAX_PER_RUN)
      if (!batch.length) { setStatus('Everything is already analyzed.'); return }
      for (let i = 0; i < batch.length; i++) {
        const review = await reviewGame(batch[i], engine, {
          signal: controller.signal, msPerPosition: 150,
          onProgress: (done, total) => setProgress({ game: i + 1, of: batch.length, done, total }),
        })
        commit({ ...dataRef.current, reviews: [...dataRef.current.reviews.filter(r => r.gameId !== review.gameId), review], updatedAt: Date.now() })
      }
      setStatus('')
    } catch (e) {
      if (!(e instanceof DOMException && e.name === 'AbortError')) setError(e instanceof Error ? e.message : 'Analysis could not finish.')
      else setStatus('Stopped. Finished games are kept.')
    } finally { engine.dispose(); setBusy(false); setProgress(null) }
  }

  async function importAndAnalyze() {
    const name = (connected || username).trim()
    if (!name) { setError('Enter a Lichess username to import public games.'); return }
    runRef.current?.abort()
    const controller = new AbortController()
    runRef.current = controller
    setBusy(true); setError(''); setStatus('Loading public games from Lichess…')
    try {
      const url = new URL(`https://lichess.org/api/games/user/${encodeURIComponent(name)}`)
      url.searchParams.set('max', count); url.searchParams.set('moves', 'true')
      url.searchParams.set('clocks', 'false'); url.searchParams.set('evals', 'false'); url.searchParams.set('opening', 'true')
      const token = getStoredToken()
      const response = await fetch(url, {
        signal: controller.signal,
        headers: { Accept: 'application/x-ndjson', ...(token ? { Authorization: `Bearer ${token.access_token}` } : {}) },
      })
      if (response.status === 404) throw new Error(`No Lichess player called “${name}”.`)
      if (response.status === 429) throw new Error('Lichess asked us to slow down. Try again in a minute.')
      if (!response.ok) throw new Error(`Lichess returned ${response.status}. Try again shortly.`)
      const games = parseLichessNdjson(await response.text(), name)
      if (!games.length) throw new Error('No standard games found for that account.')
      const current = dataRef.current
      const next = { ...current, username: name, games: mergeGames(current.games, games, name, current.username), updatedAt: Date.now() }
      // Reviews of games that are no longer kept would be orphaned; saveProfile prunes them.
      commit(next)
      setStatus('')
      setBusy(false)
      await analyze(next.games)
    } catch (e) {
      if (e instanceof DOMException && e.name === 'AbortError') setStatus('Stopped.')
      else setError(e instanceof Error ? e.message : 'Import failed.')
      setBusy(false)
    }
  }

  const stop = () => runRef.current?.abort()
  const shown = showAll ? data.games : data.games.slice(0, SHOWN)
  const pct = progress ? Math.round(((progress.game - 1 + progress.done / progress.total) / progress.of) * 100) : 0

  return (
    <HomeFrame
      mode="profile" onNavigate={onNavigate} compact busy={busy}
      kicker="Player profile" title="Your style, from your own games"
      copy="Games are reviewed by Stockfish on your device. The result is an estimate that sharpens with every game."
      actions={
        <>
          <button type="button" className="begin-game" onClick={importAndAnalyze} disabled={busy}>
            {busy ? 'Working…' : 'Import & analyze'}
          </button>
          {busy
            ? <button type="button" className="btn-ghost" onClick={stop}>Stop</button>
            : <button type="button" className="btn-ghost" onClick={() => analyze(data.games)} disabled={!pending}>
                {pending ? `Analyze ${Math.min(pending, MAX_PER_RUN)} new` : 'Up to date'}
              </button>}
        </>
      }
    >
      <div className="profile-controls">
        <label className="field">
          <span className="field-label">Lichess account</span>
          <input className="profile-input" value={username} readOnly={!!connected} disabled={busy}
            onChange={e => setUsername(e.target.value)} placeholder="username" autoCapitalize="none" autoCorrect="off" spellCheck={false}
            onKeyDown={e => { if (e.key === 'Enter' && !busy) importAndAnalyze() }} />
          {connected && <small className="profile-hint">Connected through Multiplayer</small>}
        </label>
        <Segmented<Count> legend="Games to import" name="profile-count" value={count} disabled={busy}
          onChange={setCount} options={COUNTS.map(c => ({ value: c, label: c }))} />
      </div>
      <p className="profile-privacy">Public Lichess games and the games you play against the computer are stored on this device only. Importing needs no account permission.</p>

      {(busy || status) && !error && (
        <div className="profile-progress" role="status" aria-live="polite">
          <span>{progress ? `Reviewing game ${progress.game} of ${progress.of} · position ${progress.done}/${progress.total}` : status}</span>
          {progress && <div className="profile-progress-track"><i style={{ width: `${pct}%` }} /></div>}
        </div>
      )}
      {error && <p className="profile-error" role="alert">{error}</p>}

      <section className="profile-hero" aria-label="Closest playing school">
        <div>
          <span className="setup-kicker">Closest school</span>
          <h2>{summary.label}</h2>
          {summary.school
            ? <p>Most like <b>{summary.players}</b>: {summary.why}.</p>
            : <p>{summary.focus}</p>}
        </div>
        {summary.school && (
          <div className="profile-confidence">
            <strong>{summary.confidence}</strong>
            <span>{summary.moves} moves · {summary.analyzed} games</span>
          </div>
        )}
      </section>

      {summary.metrics && (
        <>
          <section className="profile-section">
            <div className="profile-section-head"><h3>Your profile</h3><span>0–10 · same scale as the schools</span></div>
            <div className="school-weights" aria-label="Your attack, focus and defend scores">
              <WeightBar label="Attack" value={summary.axes.attack} color="var(--w-attack)" />
              <WeightBar label="Focus" value={summary.axes.focus} color="var(--w-focus)" />
              <WeightBar label="Defend" value={summary.axes.defend} color="var(--w-defend)" />
            </div>
            <p className="profile-note">Attack: captures, checks, pressure near the enemy king. Focus: accuracy overall, in the opening and when ahead. Defend: accuracy when worse, willingness to trade, early castling.</p>
          </section>

          <section className="profile-section">
            <div className="profile-section-head"><h3>Closest schools</h3><span>match %</span></div>
            <div className="profile-matches">
              {summary.matches.slice(0, 5).map((m, i) => (
                <div key={m.school} className={`profile-match${i === 0 ? ' is-top' : ''}`}>
                  <span className="profile-match-name">{m.label}<small>{m.players}</small></span>
                  <div className="weight-track"><div className="weight-fill" style={{ width: `${m.match}%` }} /></div>
                  <span className="weight-value">{m.match}</span>
                </div>
              ))}
            </div>
          </section>

          <div className="profile-lower">
            <section className="profile-section">
              <div className="profile-section-head"><h3>Strengths</h3></div>
              <ul className="profile-list">{summary.strengths.map(s => <li key={s}>{s}</li>)}</ul>
            </section>
            <section className="profile-section">
              <div className="profile-section-head"><h3>Work on next</h3></div>
              <p className="profile-note">{summary.focus}</p>
            </section>
          </div>
        </>
      )}

      <section className="profile-section">
        <div className="profile-section-head"><h3>Five things to work on</h3><span>from your games</span></div>
        <ol className="profile-tips">
          {tips.map((t, i) => (
            <li key={t.title}>
              <b>{i + 1}</b>
              <span><strong>{t.title}</strong><small>{t.body}</small></span>
            </li>
          ))}
        </ol>
      </section>

      <section className="profile-section">
        <div className="profile-section-head"><h3>Recent games</h3><span>{data.games.length} saved · {data.reviews.length} analyzed</span></div>
        {data.games.length === 0 ? (
          <p className="profile-empty">Import Lichess games, or finish a game against the computer, then study it here.</p>
        ) : (
          <div className="profile-games">
            {shown.map(g => {
              const r = reviewOf.get(g.id)
              const opponent = g.userColor === 'w' ? g.black : g.white
              return (
                <button key={g.id} type="button" className="profile-game" disabled={!r} onClick={() => r && setOpen({ game: g, review: r })}>
                  <span><b>{opponent}</b><small>{r?.opening ?? 'Not analyzed yet'} · {new Date(g.playedAt).toLocaleDateString()}</small></span>
                  <span className={`profile-result profile-result--${g.result}`}>{resultLabel[g.result]}</span>
                  <strong>{r ? `${r.accuracy}%` : '—'}</strong>
                </button>
              )
            })}
            {data.games.length > SHOWN && (
              <button type="button" className="btn-ghost profile-more" onClick={() => setShowAll(v => !v)}>
                {showAll ? 'Show fewer' : `Show all ${data.games.length}`}
              </button>
            )}
          </div>
        )}
      </section>

      {open && <GameStudy game={open.game} review={open.review} onClose={() => setOpen(null)} />}
    </HomeFrame>
  )
}
