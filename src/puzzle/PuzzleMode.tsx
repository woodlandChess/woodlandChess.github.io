import { useGameEngine } from './hooks/useGameEngine';
import { PuzzleIntroScreen } from './components/PuzzleIntroScreen';
import { PuzzleGameScreen } from './components/PuzzleGameScreen';
import { PuzzleWinScreen } from './components/PuzzleWinScreen';
import type { ModeId } from '../components/ModeNav';

interface PuzzleModeProps {
  onBack: () => void;
  onNavigate: (mode: ModeId) => void;
}

export function PuzzleMode({ onBack, onNavigate }: PuzzleModeProps) {
  const { engine, snapshot } = useGameEngine();

  if (snapshot.screen === 'game') {
    if (snapshot.loading) return <div className="puzzle-loading-screen" role="status"><div className="puzzle-loading-card"><span className="puzzle-loading-mark" aria-hidden="true">♜</span><span className="puzzle-loading-title">WOODLAND</span><span className="puzzle-loading-rule" /><span className="puzzle-loading-message">Loading puzzle from Lichess</span><span className="puzzle-loading-dots" aria-hidden="true"><i /><i /><i /></span></div></div>;
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
      loadError={snapshot.loadError}
      onNavigate={onNavigate}
    />
  );
}
