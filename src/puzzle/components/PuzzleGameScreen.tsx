import type { GameEngine, GameSnapshot } from '../core/GameEngine';
import { PuzzleHeader } from './PuzzleHeader';
import { PuzzleBoard } from './PuzzleBoard';
import { PuzzleInfoPanel } from './PuzzleInfoPanel';
import { AchievementToastStack } from './AchievementToast';

interface PuzzleGameScreenProps {
  engine: GameEngine;
  snapshot: GameSnapshot;
  onBack: () => void;
}

export function PuzzleGameScreen({ engine, snapshot, onBack }: PuzzleGameScreenProps) {
  return (
    <div className="puzzle-shell">
      <PuzzleHeader engine={engine} snapshot={snapshot} onBack={onBack} />
      <main className="game-main">
        <div className="board-col">
          <PuzzleBoard
            snapshot={snapshot}
            onSelectSquare={(r, c) => engine.selectSquare(r, c)}
          />
          <div className="board-footer">
            <div className="turn-badge">
              {snapshot.puzzle.turn === 'w' ? 'White' : 'Black'} to move
            </div>
            <div className="move-dots">
              {snapshot.puzzle.solution
                .map((_, i) => i)
                .filter((i) => i % 2 === 0)
                .map((stepIdx) => (
                  <div
                    key={stepIdx}
                    className={`move-dot${
                      stepIdx < snapshot.moveNum
                        ? ' used'
                        : stepIdx === snapshot.moveNum
                          ? ' filled'
                          : ''
                    }`}
                  />
                ))}
            </div>
          </div>
        </div>
        <PuzzleInfoPanel engine={engine} snapshot={snapshot} />
      </main>
      <AchievementToastStack achievements={snapshot.newAchievements} />
    </div>
  );
}
