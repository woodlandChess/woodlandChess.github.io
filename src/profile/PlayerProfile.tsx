import { Component, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { StockfishClient } from '../stockfish'
import { HomeFrame } from '../components/HomeFrame'
import { Segmented } from '../components/Controls'
import type { ModeId } from '../components/ModeNav'
import { getStoredToken, LichessClient } from '../lichess'
import { parseLichessNdjson, reviewGame } from './analysis'
import { clearProfile, readProfile, saveProfile, type GameReview, type PlayerProfileData, type ProfileGame } from './store'
import { makeTips, summarizeStyle } from './style'
import { AXES, AXIS_HINT, AXIS_LABEL } from './players'
import { GameStudy } from './GameStudy'
import '../styles/profile.css'

const MAX_PER_RUN = 30
const COUNTS = ['5', '10', '20', '50'] as const
type Count = (typeof COUNTS)[number]
const SHOWN = 8
/** Search time per position. Deeper = fewer misjudged moves, but a longer wait. */
const DEPTHS = { quick: 100, standard: 200, deep: 450 } as const
type Depth = keyof typeof DEPTHS

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

function PlayerProfileScreen({ onNavigate }: { onNavigate: (m: ModeId) => void }) {
  const [data, setData] = useState<PlayerProfileData>(readProfile)
  const dataRef = useRef(data)
  const [username, setUsername] = useState(data.username)
  const [count, setCount] = useState<Count>('10')
  const [depth, setDepth] = useState<Depth>('standard')
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
          signal: controller.signal, msPerPosition: DEPTHS[depth],
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
        <Segmented<Depth> legend="Analysis depth" name="profile-depth" value={depth} disabled={busy}
          onChange={setDepth} options={[{ value: 'quick', label: 'Quick' }, { value: 'standard', label: 'Standard' }, { value: 'deep', label: 'Deep' }]} />
      </div>
      <p className="profile-privacy">Public Lichess games and the games you play against the computer are stored on this device only. Importing needs no account permission.</p>

      {(busy || status) && !error && (
        <div className="profile-progress" role="status" aria-live="polite">
          <span>{progress ? `Reviewing game ${progress.game} of ${progress.of} · position ${progress.done}/${progress.total}` : status}</span>
          {progress && <div className="profile-progress-track"><i style={{ width: `${pct}%` }} /></div>}
        </div>
      )}
      {error && <p className="profile-error" role="alert">{error}</p>}

      <section className="profile-hero" aria-label="Closest player">
        <div>
          <span className="setup-kicker">{summary.players[0] ? 'Closest player' : 'Style'}</span>
          <h2>{summary.players[0] ? summary.players[0].player.name : summary.label}</h2>
          {summary.players[0]
            ? <p>{summary.players[0].match}% match · {summary.players[0].player.known}. School: <b>{summary.label}</b>.</p>
            : <p>{summary.focus}</p>}
        </div>
        {summary.school && (
          <div className="profile-confidence">
            <strong>{summary.confidence}</strong>
            <span>{summary.moves} moves · {summary.analyzed} games</span>
          </div>
        )}
      </section>

      {summary.metrics && summary.fingerprint && summary.players.length > 0 && (
        <>
          <section className="profile-section">
            <div className="profile-section-head"><h3>Your style</h3><span>0–10</span></div>
            <div className="profile-legend" aria-hidden="true">
              <span><i className="profile-swatch profile-swatch--you" />You</span>
              <span><i className="profile-swatch profile-swatch--pin" />{summary.players[0].player.name}</span>
            </div>
            <div className="profile-axes" role="list">
              {AXES.map(k => {
                const you = summary.fingerprint![k], them = summary.players[0].vector[k]
                return (
                  <div key={k} className="profile-axis" role="listitem"
                    aria-label={`${AXIS_LABEL[k]}: you ${you.toFixed(1)}, ${summary.players[0].player.name} ${them.toFixed(1)}`}>
                    <span className="profile-axis-name">{AXIS_LABEL[k]}<small>{AXIS_HINT[k]}</small></span>
                    <div className="weight-track">
                      <div className="weight-fill" style={{ width: `${you * 10}%` }} />
                      <i className="profile-axis-gap" style={{ left: `${Math.min(you, them) * 10}%`, width: `${Math.abs(you - them) * 10}%` }} />
                      <i className="profile-axis-pin" style={{ left: `${them * 10}%` }} />
                    </div>
                    <span className="profile-axis-nums"><b>{you.toFixed(1)}</b><em>{them.toFixed(1)}</em></span>
                  </div>
                )
              })}
            </div>
            <p className="profile-note">
              Style, not strength: how you play, never how well. You and {summary.players[0].player.name} are most alike in {summary.players[0].alike.map(a => AXIS_LABEL[a].toLowerCase()).join(' and ')}, and differ most in {AXIS_LABEL[summary.players[0].differs].toLowerCase()}.
            </p>
          </section>

          <section className="profile-section">
            <div className="profile-section-head"><h3>Closest players</h3><span>match %</span></div>
            <div className="profile-matches">
              {summary.players.slice(0, 6).map((m, i) => (
                <div key={m.player.name} className={`profile-match${i === 0 ? ' is-top' : ''}`}>
                  <span className="profile-match-name">{m.player.name}<small>{m.player.years} · {m.player.known}</small></span>
                  <div className="weight-track"><div className="weight-fill" style={{ width: `${m.match}%` }} /></div>
                  <span className="weight-value">{m.match}</span>
                </div>
              ))}
            </div>
            <p className="profile-note">Compared with {summary.players.length} players. These are reference profiles, so treat the order as a guide, not a verdict.</p>
          </section>

          {summary.tactics && (
            <section className="profile-section">
              <div className="profile-section-head"><h3>Tactics &amp; strategy</h3><span>from your errors</span></div>
              <div className="profile-stats">
                <div><strong>{summary.tactics.criticalSolved === null ? '—' : `${Math.round(summary.tactics.criticalSolved * 100)}%`}</strong><span>Only-move positions solved{summary.tactics.criticalN ? ` (of ${summary.tactics.criticalN})` : ''}</span></div>
                <div><strong>{summary.tactics.tacticalErrors}</strong><span>Missed a capture, check or mate</span></div>
                <div><strong>{summary.tactics.quietErrors}</strong><span>Missed a quiet move or plan</span></div>
                <div><strong>{summary.tactics.lean === 'tactics' ? 'Tactics' : summary.tactics.lean === 'strategy' ? 'Strategy' : summary.tactics.lean === 'balanced' ? 'Balanced' : '—'}</strong><span>Where you lose most</span></div>
              </div>
            </section>
          )}

          <section className="profile-section">
            <div className="profile-section-head"><h3>Closest schools</h3><span>from the player match</span></div>
            <div className="profile-matches profile-matches--schools">
              {summary.matches.slice(0, 3).map((m, i) => (
                <div key={m.school} className={`profile-match${i === 0 ? ' is-top' : ''}`}>
                  <span className="profile-match-name">{m.label}<small>{m.players}</small></span>
                  <div className="weight-track"><div className="weight-fill" style={{ width: `${m.match}%` }} /></div>
                  <span className="weight-value">{m.match}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="profile-section">
            <div className="profile-section-head"><h3>Strengths</h3></div>
            <ul className="profile-list">{summary.strengths.map(s => <li key={s}>{s}</li>)}</ul>
          </section>
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

/** If saved study data is ever unreadable, show a way out instead of a blank page. */
class ProfileBoundary extends Component<{ onNavigate: (m: ModeId) => void; children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  render() {
    if (!this.state.failed) return this.props.children
    return (
      <HomeFrame mode="profile" onNavigate={this.props.onNavigate} compact kicker="Player profile" title="Your saved study could not be read"
        copy="Something in the saved data is out of date. Clearing it only removes your analysed games on this device."
        actions={
          <button type="button" className="begin-game" onClick={() => { clearProfile(); window.location.reload() }}>
            Clear saved study
          </button>
        }>
        <p className="profile-empty">Your Lichess games can be imported again at any time.</p>
      </HomeFrame>
    )
  }
}

export function PlayerProfile({ onNavigate }: { onBack?: () => void; onNavigate: (m: ModeId) => void }) {
  return <ProfileBoundary onNavigate={onNavigate}><PlayerProfileScreen onNavigate={onNavigate} /></ProfileBoundary>
}
