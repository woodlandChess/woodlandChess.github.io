import type { GameEngine, GameSnapshot } from '../core/GameEngine';
import { IconCrown } from './icons';

interface PuzzleWinScreenProps {
  engine: GameEngine;
  snapshot: GameSnapshot;
  onBack: () => void;
}

export function PuzzleWinScreen({ engine, snapshot, onBack }: PuzzleWinScreenProps) {
  const isDaily = snapshot.mode === 'daily';

  return (
    <div className="puzzle-win">
      <div className="win-content">
        <div className="win-crown">
          <IconCrown />
        </div>
        <div className="win-label">
          {isDaily ? 'Daily Challenge Complete' : 'All Puzzles Solved'}
        </div>
        <h2 className="win-title">{isDaily ? 'Well Played' : 'Grand Master'}</h2>
        <div className="win-score-wrap">
          <span className="win-score-num">{snapshot.score}</span>
          <span className="win-score-lbl">points</span>
        </div>
        <div className="win-actions">
          <button type="button" className="begin-game" onClick={() => engine.startRun()}>
            Play Again
          </button>
          <button type="button" className="new-game" onClick={onBack}>
            Return Home
          </button>
        </div>
      </div>
    </div>
  );
}
