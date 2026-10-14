import { useGameEngine } from './hooks/useGameEngine';
import { PuzzleIntroScreen } from './components/PuzzleIntroScreen';
import { PuzzleGameScreen } from './components/PuzzleGameScreen';
import { PuzzleWinScreen } from './components/PuzzleWinScreen';

interface PuzzleModeProps {
  onBack: () => void;
}

export function PuzzleMode({ onBack }: PuzzleModeProps) {
  const { engine, snapshot } = useGameEngine();

  if (snapshot.screen === 'game') {
    return (
      <PuzzleGameScreen
        engine={engine}
        snapshot={snapshot}
        onBack={() => { engine.goHome(); }}
      />
    );
  }

  if (snapshot.screen === 'win') {
    return (
      <PuzzleWinScreen
        engine={engine}
        snapshot={snapshot}
        onBack={onBack}
      />
    );
  }

  return (
    <PuzzleIntroScreen
      engine={engine}
      soundEnabled={snapshot.soundEnabled}
      onBack={onBack}
    />
  );
}
