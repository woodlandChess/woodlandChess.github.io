import type { GameEngine, GameSnapshot } from '../core/GameEngine';
import { IconScroll, IconTide, IconKey, IconDroplet } from './icons';

interface PuzzleInfoPanelProps {
  engine: GameEngine;
  snapshot: GameSnapshot;
}

export function PuzzleInfoPanel({ engine, snapshot }: PuzzleInfoPanelProps) {
  const { puzzle } = snapshot;

  return (
    <div className="info-col">
      {snapshot.mode === 'daily' && (
        <div className="game-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <IconDroplet style={{ width: 12, height: 12 }} />
          Daily Challenge
        </div>
      )}
      <div className={`game-badge ${puzzle.difficulty}`}>
        {puzzle.difficulty.charAt(0).toUpperCase() + puzzle.difficulty.slice(1)}
      </div>
      {puzzle.year && puzzle.year.trim().length > 1 && <div className="puzzle-year">{puzzle.year}</div>}
      <h2 className="puzzle-title">{puzzle.title}</h2>
      <div className="puzzle-subtitle">{puzzle.subtitle}</div>
      <p className="puzzle-desc">{puzzle.desc}</p>

      <div className="hint-row">
        <button type="button" className="btn-hint" onClick={() => engine.showHint()}>
          <IconScroll style={{ width: 13, height: 13 }} />
          Hint
        </button>
        <div className="hint-text">{snapshot.hintText}</div>
      </div>

      <div className="move-history">
        {snapshot.moveHistory.map((entry) => (
          <div className="move-entry" key={entry.index}>
            <span className="mn">{entry.index + 1}.</span>
            <span className={`mv${entry.side === 'player' ? ' correct' : ''}`}>{entry.notation}</span>
            <span className="mn">{entry.sideLabel}</span>
          </div>
        ))}
      </div>

      <div className="action-row">
        <button type="button" className="btn-ghost" onClick={() => engine.resetCurrentPuzzle()}>
          <IconTide style={{ width: 13, height: 13 }} />
          Reset
        </button>
        {snapshot.puzzleDone && (
          <button type="button" className="btn-next" onClick={() => engine.nextPuzzle()}>
            Next Puzzle
            <IconKey style={{ width: 13, height: 13 }} />
          </button>
        )}
      </div>

      <div className={`feedback ${snapshot.feedback.type}`}>{snapshot.feedback.message}</div>

      <div className="stat-row">
        <div className="stat-item">
          <span className="stat-n">{snapshot.solved}</span>
          <span className="stat-l">Solved</span>
        </div>
        <div className="stat-sep" />
        <div className="stat-item">
          <span className="stat-n">{snapshot.streak}</span>
          <span className="stat-l">Streak</span>
        </div>
        <div className="stat-sep" />
        <div className="stat-item">
          <span className="stat-n">{snapshot.bestStreak || '—'}</span>
          <span className="stat-l">Best</span>
        </div>
      </div>
    </div>
  );
}
