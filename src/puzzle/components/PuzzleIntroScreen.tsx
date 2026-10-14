import type { GameEngine } from '../core/GameEngine';
import { IconSound } from './icons';

interface PuzzleIntroScreenProps {
  engine: GameEngine;
  soundEnabled: boolean;
  onBack: () => void;
  loadError?: string;
}

export function PuzzleIntroScreen({ engine, soundEnabled, onBack, loadError }: PuzzleIntroScreenProps) {
  return (
    <div className="puzzle-intro">
      <div className="puzzle-intro-bg" aria-hidden="true" />

      <div className="puzzle-intro-header">
        <button type="button" className="back-btn" onClick={onBack}>
          ← Back
        </button>
        <button
          type="button"
          className="icon-btn"
          aria-label={soundEnabled ? 'Mute sound' : 'Enable sound'}
          onClick={() => engine.toggleSound()}
        >
          <IconSound muted={!soundEnabled} />
        </button>
      </div>

      <div className="puzzle-intro-content">
        <div className="puzzle-intro-eyebrow">Woodland Chess</div>
        <h1 className="puzzle-intro-title">
          ♜ Check<em>mate</em>
        </h1>
        <p className="puzzle-intro-sub">
          Practice tactical puzzles from the Lichess puzzle database, with ratings, themes, hints and a daily challenge.
        </p>
        <div className="puzzle-intro-meta">
          <span className="meta-pill">Lichess Puzzle Database</span>
          <span className="meta-dot" />
          <span className="meta-pill">Rated Tactics</span>
          <span className="meta-dot" />
          <span className="meta-pill">Daily Challenge</span>
        </div>
        {loadError && <p className="puzzle-load-error" role="alert">{loadError}</p>}
        <div className="puzzle-intro-actions">
          <button
            type="button"
            className="begin-game"
          onClick={() => engine.startRun()}
          >
            Begin Playing
          </button>
          <button
            type="button"
            className="new-game"
            onClick={() => engine.startDaily()}
          >
            Daily Challenge
          </button>
        </div>
        <div className="puzzle-intro-hint">
          a single position. a forced line. no room to improvise.
        </div>
      </div>
    </div>
  );
}
