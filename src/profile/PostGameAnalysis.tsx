import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { Chess, type Color } from 'chess.js'
import { EnginePool, REVIEW_DEPTH, REVIEW_MAX_MS } from './enginePool'
import { reviewGame } from './analysis'
import { GameStudy } from './GameStudy'
import { readProfile, saveProfile, type GameReview, type ProfileGame } from './store'
import '../styles/profile.css'

export interface PostGameInput {
  /** Legal UCI moves of the finished game. */
  moves: string[]
  userColor: Color
  result: ProfileGame['result']
  opponentName: string
  /** Game id already saved in My style (games against the computer): the review is stored there too. */
  profileId?: string
}

const cache = new Map<string, GameReview>()

export function PostGameAnalysis({ input }: { input: PostGameInput }) {
  const { moves, userColor, result, opponentName, profileId } = input
  const key = `${userColor}:${moves.join(' ')}`
  const game = useMemo<ProfileGame>(() => ({
    id: profileId ?? `post-${userColor}-${moves.join('')}`, source: profileId ? 'ai' : 'lichess', playedAt: Date.now(),
    white: userColor === 'w' ? 'You' : opponentName, black: userColor === 'b' ? 'You' : opponentName,
    userColor, result, moves: moves.join(' '),
  }), [key, result, opponentName, profileId])  // eslint-disable-line react-hooks/exhaustive-deps
  const [review, setReview] = useState<GameReview | null>(() => cache.get(key) ?? null)
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null)
  const [error, setError] = useState('')
  const [study, setStudy] = useState(false)

  useEffect(() => {
    const cached = cache.get(key)
    if (cached) { setReview(cached); return }
    const controller = new AbortController()
    const engine = new EnginePool()
    setReview(null); setError('')
    reviewGame(game, engine, {
      signal: controller.signal, msPerPosition: REVIEW_MAX_MS, depth: REVIEW_DEPTH, concurrency: engine.size,
      onProgress: (done, total) => setProgress({ done, total }),
    }).then(r => {
      cache.set(key, r)
      setReview(r)
      if (profileId) {      // keep it with the other analyzed games in the profile
        const data = readProfile()
        if (data.games.some(g => g.id === profileId)) {
          saveProfile({ ...data, reviews: [...data.reviews.filter(x => x.gameId !== profileId), r], updatedAt: Date.now() })
        }
      }
    }).catch(e => {
      if (!(e instanceof DOMException && e.name === 'AbortError')) setError(e instanceof Error ? e.message : 'Analysis could not finish.')
    }).finally(() => engine.dispose())
    return () => controller.abort()
  }, [key, game, profileId])

  // Safety net: the review needs every move to be legal.
  const valid = useMemo(() => { try { const c = new Chess(); for (const m of moves) c.move({ from: m.slice(0, 2), to: m.slice(2, 4), promotion: m[4] }); return true } catch { return false } }, [moves])
  if (!valid) return null

  return (
    <section className="gr-analysis" aria-label="Game analysis" aria-live="polite">
      <p className="gr-analysis-title">Game analysis</p>
      {error ? <p className="gr-note">{error}</p>
        : !review ? (
          <div className="gr-analysis-wait">
            <div className="gr-progress" role="progressbar" aria-valuemin={0} aria-valuemax={100}
              aria-valuenow={progress ? Math.round((progress.done / progress.total) * 100) : 0}>
              <span style={{ width: `${progress ? (progress.done / progress.total) * 100 : 0}%` }} />
            </div>
            <p className="gr-note">Analyzing your moves{progress ? ` · ${progress.done} / ${progress.total}` : '…'}</p>
          </div>
        ) : (
          <>
            <div className="gr-analysis-top">
              <div className="gr-acc"><strong>{review.accuracy}%</strong><span>accuracy</span></div>
              <div className="study-counts" aria-label="Your move quality">
                {review.brilliant > 0 && <span className="grade-brilliant"><i>!!</i> Brilliant <b>{review.brilliant}</b></span>}
                {review.great > 0 && <span className="grade-great"><i>!</i> Great <b>{review.great}</b></span>}
                <span className="grade-inaccuracy"><i>?!</i> Inaccuracies <b>{review.inaccuracies}</b></span>
                <span className="grade-mistake"><i>?</i> Mistakes <b>{review.mistakes}</b></span>
                <span className="grade-blunder"><i>??</i> Blunders <b>{review.blunders}</b></span>
              </div>
            </div>
            <button type="button" className="gr-btn gr-btn--analysis" onClick={() => setStudy(true)}>Full analysis</button>
          </>
        )}
      {/* Portalled out of the result card: the card is animated (transformed), which would trap a fixed-position overlay. */}
      {study && review && createPortal(
        <div onKeyDown={e => e.stopPropagation()}><GameStudy game={game} review={review} onClose={() => setStudy(false)} /></div>,
        document.body,
      )}
    </section>
  )
}
