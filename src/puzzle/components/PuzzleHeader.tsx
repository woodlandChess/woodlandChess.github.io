import type { GameEngine, GameSnapshot } from '../core/GameEngine';
import { IconSound } from './icons';

interface PuzzleHeaderProps {
  engine: GameEngine;
  snapshot: GameSnapshot;
  onBack: () => void;
}

export function PuzzleHeader({ engine, snapshot, onBack }: PuzzleHeaderProps) {
  const progressPct = snapshot.mode === 'daily' ? 100 : ((snapshot.index % 20) / 20) * 100;

  return (
    <header className="hdr">
      <button type="button" className="hdr-brand" onClick={onBack}>
        ♜ WOODLAND
      </button>
      <div className="hdr-center">
        <div className="hdr-puzzle-num">{String(snapshot.index + 1).padStart(2, '0')}</div>
        <div className="progress-bar-wrap">
          <div className="progress-bar-fill" style={{ width: `${progressPct}%` }} />
        </div>
      </div>
      <div className="hdr-right">
        <div className="hdr-score">
          <span className="score-label">Score</span>
          <span className="score-val">{snapshot.score}</span>
        </div>
        <button
          type="button"
          className="icon-btn"
          aria-label={snapshot.soundEnabled ? 'Mute sound' : 'Enable sound'}
          onClick={() => engine.toggleSound()}
        >
          <IconSound muted={!snapshot.soundEnabled} />
        </button>
      </div>
    </header>
  );
}
