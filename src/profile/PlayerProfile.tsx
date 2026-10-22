import { useEffect, useMemo, useRef, useState } from 'react'
import { StockfishClient } from '../stockfish'
import { HomeFrame } from '../components/HomeFrame'
import type { ModeId } from '../components/ModeNav'
import { getStoredToken, LichessClient } from '../lichess'
import { Chess, type Square } from 'chess.js'
import { ChessBoard } from '../ChessBoard'
import { readProfile, saveProfile, parseLichessNdjson, reviewGame, summarizeStyle, type PlayerProfileData, type ProfileGame, type GameReview } from './analysis'
import '../styles/profile.css'

interface PlayerTip { title: string; body: string }
function makeTips(games: ProfileGame[], reviews: GameReview[]): PlayerTip[] {
  const moves = reviews.flatMap(r => r.moves)
  const misses = moves.filter(m => m.loss >= 50).sort((a,b) => b.loss-a.loss)
  const openings = reviews.map(r => r.opening).filter(o => o !== 'Unclassified opening')
  const result: PlayerTip[] = []
  if (!reviews.length) return [
    { title:'Import a few games', body:'Your personal study and advice will become more useful as analyzed games accumulate.' },
    { title:'Pause before forcing moves', body:'Check captures, checks, and threats for both sides before committing.' },
    { title:'Protect your king', body:'Finish development and look for safe castling opportunities.' },
    { title:'Review every loss', body:'Look for the first position where the evaluation shifted sharply.' },
    { title:'Compare your openings', body:'Repeated opening positions can reveal where a little study pays off.' },
  ]
  const late = moves.filter(m => m.phase === 'Endgame' && m.loss >= 50).length
  const openingMistakes = moves.filter(m => m.phase === 'Opening' && m.loss >= 50).length
  const captureMistakes = misses.filter(m => m.tags.includes('Capture')).length
  const phaseCounts = ['Opening','Middlegame','Endgame'].map(phase => ({ phase, count:moves.filter(m=>m.phase===phase && m.loss>=50).length })).sort((a,b)=>b.count-a.count)
  if (openingMistakes) result.push({ title:'Slow down in the opening', body:`${openingMistakes} analyzed opening moves lost at least 50 centipawns. Check development and king safety before pawn grabs.` })
  if (captureMistakes) result.push({ title:'Verify every exchange', body:`${captureMistakes} inaccurate or worse moves were captures. Before taking, check the opponent's recapture and the piece left undefended.` })
  if (late) result.push({ title:'Practice endgame calculation', body:`${late} endgame moves lost at least 50 centipawns. Count pawn races and check king activity before trading pieces.` })
  if (phaseCounts[0]?.count) result.push({ title:`Review ${phaseCounts[0].phase.toLowerCase()} turning points`, body:`This phase contains the most costly moves (${phaseCounts[0].count}). Replay the marked moves and compare candidate moves.` })
  const common = openings.length ? openings[0] : ''
  if (common) result.push({ title:'Build a small opening plan', body:`Review ${common} and note one development plan and one common pawn break for your side.` })
  if (misses.length) result.push({ title:'Scan for opponent threats', body:`Your largest measured swing was ${Math.round(misses[0].loss)} centipawns. Before each move, ask what your opponent threatens next.` })
  if (result.length < 5) {
    const fallback: PlayerTip[] = [
      { title:'Compare candidate moves', body:'For each critical position, identify two legal choices and the opponent reply to each before playing.' },
      { title:'Check loose pieces', body:'Before moving, scan for pieces that are attacked more times than they are defended.' },
      { title:'Use the king actively', body:'In simplified positions, centralize your king while keeping it outside the opponent’s pawn checks.' },
      { title:'Review your biggest swings', body:'Replay the moves with the largest engine loss and write down the threat you missed.' },
      { title:'Study recurring openings', body:'Revisit the opening positions that appear most often and learn a simple development plan.' },
    ]
    for (const tip of fallback) if (result.length < 5 && !result.some(item => item.title === tip.title)) result.push(tip)
  }
  result.push({ title:'Keep a post-game habit', body:`You have ${games.length} games and ${reviews.length} engine reviews. Revisit one turning point after each new game.` })
  return result.slice(0,5)
}

export function PlayerProfile({ onBack, onNavigate }: { onBack: () => void; onNavigate: (m: ModeId) => void }) {
  const [data, setData] = useState<PlayerProfileData>(readProfile)
  const [username, setUsername] = useState(data.username)
  const [busy, setBusy] = useState(false)
  const [progress, setProgress] = useState('')
  const [error, setError] = useState('')
  const [selectedReview, setSelectedReview] = useState<GameReview | null>(null)
  const [selectedGame, setSelectedGame] = useState<ProfileGame | null>(null)
  const [reviewPly, setReviewPly] = useState(0)
  const [reviewMoveIndex, setReviewMoveIndex] = useState(0)
  const [maxGames, setMaxGames] = useState(10)
  const [connectedUsername, setConnectedUsername] = useState('')
  const runRef = useRef<AbortController | null>(null)
  const summary = useMemo(() => summarizeStyle(data.games, data.reviews), [data])
  const reviewPosition = useMemo(() => {
    if (!selectedGame) return new Chess()
    const c = new Chess()
    let applied = 0
    for (const uci of selectedGame.moves.trim().split(/\s+/).filter(Boolean).slice(0, reviewPly)) {
      try { c.move({ from: uci.slice(0,2) as Square, to: uci.slice(2,4) as Square, promotion: uci[4] }); applied++ } catch { break }
    }
    return c
  }, [selectedGame, reviewPly])

  useEffect(() => {
    let active = true
    const token = getStoredToken()
    if (token) new LichessClient(token.access_token).getProfile().then(p => {
      if (active) { setConnectedUsername(p.username); setUsername(p.username); setData(current => ({ ...current, username: p.username })) }
    }).catch(() => { /* disconnected or expired, keep manual username entry */ })
    return () => { active = false; runRef.current?.abort() }
  }, [])

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
    const name = (connectedUsername || username).trim()
    if (!name) { setError('Enter a Lichess username to import public games.'); return }
    setBusy(true); setError(''); setProgress('Loading public games from Lichess…')
    try {
      const url = new URL(`https://lichess.org/api/games/user/${encodeURIComponent(name)}`)
      url.searchParams.set('max', String(maxGames)); url.searchParams.set('moves', 'true')
      url.searchParams.set('clocks', 'false'); url.searchParams.set('evals', 'false'); url.searchParams.set('opening', 'true')
      const token = getStoredToken()
      const response = await fetch(url, { headers: { Accept: 'application/x-ndjson', ...(token ? { Authorization: `Bearer ${token.access_token}` } : {}) } })
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
      <label className={`profile-field${connectedUsername ? ' profile-field--connected' : ''}`}><span>{connectedUsername ? 'Lichess account' : 'Lichess username'}</span><input value={connectedUsername || username} onChange={e => setUsername(e.target.value)} placeholder="Your public username" autoCapitalize="none" autoCorrect="off" readOnly={!!connectedUsername} />{connectedUsername && <small>Connected through Multiplayer</small>}</label>
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
    <section className="profile-section"><div className="profile-section-head"><h3>Five things to work on</h3><span>Based on your analyzed games</span></div>
      <ol className="profile-tips">{makeTips(data.games, data.reviews).map((tip, i) => <li key={tip.title}><b>{String(i+1).padStart(2,'0')}</b><span><strong>{tip.title}</strong><small>{tip.body}</small></span></li>)}</ol>
    </section>
    <section className="profile-section"><div className="profile-section-head"><h3>Recent games</h3><span>Stockfish move review</span></div>
      {data.games.length ? <div className="profile-games">{data.games.slice(0,12).map(g => { const r = data.reviews.find(x => x.gameId === g.id); const opponent = g.userColor === 'w' ? g.black : g.white; return <button type="button" className="profile-game" key={g.id} onClick={() => { if (!r) return; setSelectedReview(r); setSelectedGame(g); setReviewPly(0); setReviewMoveIndex(0) }} disabled={!r}><span><b>{opponent}</b><small>{g.source === 'lichess' ? 'Lichess' : 'Computer'} · {new Date(g.playedAt).toLocaleDateString()}</small></span><span className={`profile-result profile-result--${g.result}`}>{g.result}</span><strong>{r ? `${r.accuracy}%` : 'Pending'}</strong></button>})}</div> : <div className="profile-empty">Your analyzed games will appear here.</div>}
    </section>
    {selectedReview && selectedGame && <div className="profile-review-backdrop" role="presentation" onClick={() => { setSelectedReview(null); setSelectedGame(null) }}><section className="profile-review" role="dialog" aria-modal="true" aria-label="Game review" onClick={e => e.stopPropagation()}><button type="button" className="profile-close" onClick={() => { setSelectedReview(null); setSelectedGame(null) }} aria-label="Close review">×</button><span className="profile-eyebrow">Game study · {selectedGame.userColor === 'w' ? selectedGame.white : selectedGame.black}</span><h2>{selectedReview.accuracy}% accuracy</h2><p>{selectedReview.opening} · {selectedReview.blunders} blunders · {selectedReview.mistakes} mistakes</p><div className="profile-board"><ChessBoard board={reviewPosition.board()} onSquareClick={() => {}} selected={null} legalTargets={[]} trail={reviewPosition.history({ verbose: true }).slice(-1).map(m => ({ from:m.from, to:m.to, color:m.color }))} orientation={selectedGame.userColor} interactive={false} /></div><div className="profile-board-controls"><button type="button" onClick={() => { setReviewMoveIndex(i => Math.max(0,i-1)); setReviewPly(p => Math.max(0,p-1)) }} disabled={reviewPly===0}>‹ Previous</button><span>{reviewPly===0 ? 'Initial position' : `Move ${Math.ceil(reviewPly/2)}${reviewPly%2 ? ' white' : ' black'}`}</span><button type="button" onClick={() => { const max=selectedGame.moves.trim().split(/\s+/).filter(Boolean).length; setReviewMoveIndex(i => Math.min(max,i+1)); setReviewPly(p => Math.min(max,p+1)) }} disabled={reviewPly>=selectedGame.moves.trim().split(/\s+/).filter(Boolean).length}>Next ›</button></div>{selectedReview.moves[reviewMoveIndex] && <p className="profile-current-analysis"><strong>{selectedReview.moves[reviewMoveIndex].san}</strong><span>{selectedReview.moves[reviewMoveIndex].grade} · {Math.round(selectedReview.moves[reviewMoveIndex].loss)} cp loss · {selectedReview.moves[reviewMoveIndex].phase}</span></p>}<div className="profile-moves">{selectedReview.moves.map((m,i) => <button type="button" key={m.ply} className={`profile-move-row${reviewMoveIndex===i?' is-current':''}`} onClick={() => { setReviewMoveIndex(i); setReviewPly(m.ply) }}><span>{Math.ceil(m.ply / 2)}{m.ply % 2 ? '.' : '…'}</span><b>{m.san}</b><em className={`grade-${m.grade.toLowerCase()}`}>{m.grade} · {Math.round(m.loss)} cp</em><small>{m.phase}{m.tags.length ? ` · ${m.tags}` : ''}</small></button>)}</div></section></div>}
  </HomeFrame>
}
