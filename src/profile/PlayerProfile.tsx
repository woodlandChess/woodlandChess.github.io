import { useEffect, useMemo, useRef, useState } from 'react'
import { StockfishClient } from '../stockfish'
import { HomeFrame } from '../components/HomeFrame'
import type { ModeId } from '../components/ModeNav'
import { readProfile, saveProfile, parseLichessNdjson, reviewGame, summarizeStyle, type PlayerProfileData, type ProfileGame, type GameReview } from './analysis'
import '../styles/profile.css'

export function PlayerProfile({ onBack, onNavigate }: { onBack: () => void; onNavigate: (m: ModeId) => void }) {
  const [data, setData] = useState<PlayerProfileData>(readProfile)
  const [username, setUsername] = useState(data.username)
  const [busy, setBusy] = useState(false)
  const [progress, setProgress] = useState('')
  const [error, setError] = useState('')
  const [selectedReview, setSelectedReview] = useState<GameReview | null>(null)
  const [maxGames, setMaxGames] = useState(10)
  const runRef = useRef<AbortController | null>(null)
  const summary = useMemo(() => summarizeStyle(data.games, data.reviews), [data])

  useEffect(() => () => runRef.current?.abort(), [])

  async function analyzeGames(games: ProfileGame[], nextUsername = data.username) {
    runRef.current?.abort()
    const controller = new AbortController()
    runRef.current = controller
    setBusy(true); setError('')
    const engine = new StockfishClient()
    try {
      const known = new Set(data.reviews.map(r => r.gameId))
      const fresh = games.filter(g => !known.has(g.id)).slice(0, 30)
      const reviews = [...data.reviews]
      for (let i = 0; i < fresh.length; i++) {
        setProgress(`Reviewing game ${i + 1} of ${fresh.length}`)
        reviews.push(await reviewGame(fresh[i], engine, controller.signal))
      }
      const merged = new Map([...data.games, ...games].map(g => [g.id, g]))
      const next = { username: nextUsername, games: [...merged.values()].sort((a,b) => b.playedAt-a.playedAt), reviews, updatedAt: Date.now() }
      saveProfile(next); setData(next); setProgress('')
    } catch (e) {
      if (!(e instanceof DOMException && e.name === 'AbortError')) setError(e instanceof Error ? e.message : 'Analysis could not finish.')
    } finally { engine.dispose(); setBusy(false); setProgress('') }
  }

  async function importLichess() {
    const name = username.trim()
    if (!name) { setError('Enter a Lichess username to import public games.'); return }
    setBusy(true); setError(''); setProgress('Loading public games from Lichess…')
    try {
      const url = new URL(`https://lichess.org/api/games/user/${encodeURIComponent(name)}`)
      url.searchParams.set('max', String(maxGames)); url.searchParams.set('moves', 'true')
      url.searchParams.set('clocks', 'false'); url.searchParams.set('evals', 'false'); url.searchParams.set('opening', 'true')
      const response = await fetch(url, { headers: { Accept: 'application/x-ndjson' } })
      if (!response.ok) throw new Error(response.status === 429 ? 'Lichess is rate limiting requests. Try again in a minute.' : `Lichess returned ${response.status}. Check the username and try again.`)
      const games = parseLichessNdjson(await response.text(), name)
      if (!games.length) throw new Error('No public games with moves were found for that username.')
      await analyzeGames(games, name)
    } catch(e) { setBusy(false); setProgress(''); setError(e instanceof Error ? e.message : 'Could not import games from Lichess.') }
  }

  async function reanalyze() { await analyzeGames(data.games) }

  return <HomeFrame mode="profile" onNavigate={onNavigate} compact busy={busy} kicker="Player profile" title="Your chess, in its own light" titleId="profile-title"
    copy="A local study of your games, reviewed with Stockfish. Style matches are clues, not labels." actions={<button type="button" className="btn-ghost" onClick={onBack}>Return to play</button>}>
    <div className="profile-controls">
      <label className="profile-field"><span>Lichess username</span><input value={username} onChange={e => setUsername(e.target.value)} placeholder="Your public username" autoCapitalize="none" autoCorrect="off" /></label>
      <label className="profile-field profile-count"><span>Games</span><select value={maxGames} onChange={e => setMaxGames(Number(e.target.value))}><option value={5}>Last 5</option><option value={10}>Last 10</option><option value={20}>Last 20</option><option value={50}>Last 50</option></select></label>
      <button className="profile-primary" onClick={importLichess} disabled={busy}>{busy ? 'Studying…' : 'Import & analyze'}</button>
      <button className="profile-secondary" onClick={reanalyze} disabled={busy || !data.games.length}>Update study</button>
    </div>
    <p className="profile-privacy">Public Lichess games and locally played computer games are stored on this device. Import needs no account permission or other API.</p>
    {progress && <p className="profile-progress" role="status">{progress}</p>}
    {error && <p className="profile-error" role="alert">{error}</p>}
    <section className="profile-hero" aria-label="Style summary">
      <div><span className="profile-eyebrow">Current school</span><h2>{data.games.length ? summary.school : 'Still taking shape'}</h2><p>{data.games.length ? `Closest famous style: ${summary.player}` : 'Import Lichess games or finish a game against the computer.'}</p></div>
      <div className="profile-confidence"><strong>{summary.confidence}</strong><span>{summary.games} games · {data.reviews.length} analyzed</span></div>
    </section>
    <section className="profile-section"><div className="profile-section-head"><h3>Playing schools</h3><span>Pattern match · relative</span></div>
      {Object.entries(summary.scores).sort((a,b) => b[1]-a[1]).slice(0,5).map(([name,score]) => <div className="profile-bar" key={name}><span>{name}</span><div><i style={{ width: `${score}%` }} /></div><b>{score}</b></div>)}
    </section>
    <div className="profile-lower"><section className="profile-section"><h3>On the board</h3>{summary.strengths.map(s => <p className="profile-note" key={s}>{s}</p>)}</section><section className="profile-section"><h3>Next study</h3><p className="profile-note">{summary.focus}</p></section></div>
    <section className="profile-section"><div className="profile-section-head"><h3>Recent games</h3><span>Stockfish move review</span></div>
      {data.games.length ? <div className="profile-games">{data.games.slice(0,12).map(g => { const r = data.reviews.find(x => x.gameId === g.id); const opponent = g.userColor === 'w' ? g.black : g.white; return <button className="profile-game" key={g.id} onClick={() => r && setSelectedReview(r)} disabled={!r}><span><b>{opponent}</b><small>{g.source === 'lichess' ? 'Lichess' : 'Computer'} · {new Date(g.playedAt).toLocaleDateString()}</small></span><span className={`profile-result profile-result--${g.result}`}>{g.result}</span><strong>{r ? `${r.accuracy}%` : 'Pending'}</strong></button>})}</div> : <div className="profile-empty">Your analyzed games will appear here.</div>}
    </section>
    {selectedReview && <div className="profile-review-backdrop" role="presentation" onClick={() => setSelectedReview(null)}><section className="profile-review" role="dialog" aria-modal="true" aria-label="Game review" onClick={e => e.stopPropagation()}><button className="profile-close" onClick={() => setSelectedReview(null)} aria-label="Close review">×</button><span className="profile-eyebrow">Move by move</span><h2>{selectedReview.accuracy}% accuracy</h2><p>{selectedReview.opening} · {selectedReview.blunders} blunders · {selectedReview.mistakes} mistakes</p><div className="profile-moves">{selectedReview.moves.map(m => <div key={m.ply}><span>{Math.ceil(m.ply / 2)}{m.ply % 2 ? '.' : '…'}</span><b>{m.san}</b><em className={`grade-${m.grade.toLowerCase()}`}>{m.grade}</em><small>{m.phase}{m.tags.length ? ` · ${m.tags.join(', ')}` : ''}</small></div>)}</div></section></div>}
  </HomeFrame>
}
