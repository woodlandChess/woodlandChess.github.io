import { useEffect } from 'react';
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
  // Like a native app screen: exactly one viewport tall, the page itself never scrolls.
  useEffect(() => {
    const root = document.documentElement;
    root.classList.add('is-game');
    return () => root.classList.remove('is-game');
  }, []);

  return (
    <div className="puzzle-shell">
      <PuzzleHeader engine={engine} snapshot={snapshot} onBack={onBack} />
      <main className="game-main">
        <div className="board-col">
          <div className="board-stage">
            <PuzzleBoard
              snapshot={snapshot}
              onSelectSquare={(r, c) => engine.selectSquare(r, c)}
              onMoveSquares={(from, to) => engine.moveSquares(from, to)}
              getLegalMoves={(r, c) => engine.legalMovesFrom(r, c)}
            />
          </div>
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
