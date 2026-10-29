import type { GameEngine } from '../core/GameEngine';
import { HomeFrame } from '../../components/HomeFrame';
import type { ModeId } from '../../components/ModeNav';
import { IconCalendar, IconOnline, IconPuzzle, IconVolume } from '../../components/ModeIcons';
import { sound } from '../../sound';
import { AchievementsPanel } from './AchievementsPanel';

interface PuzzleIntroScreenProps {
  engine: GameEngine;
  soundEnabled: boolean;
  onNavigate: (mode: ModeId) => void;
  loadError?: string;
}

export function PuzzleIntroScreen({ engine, soundEnabled, onNavigate, loadError }: PuzzleIntroScreenProps) {
  return (
    <HomeFrame
      mode="puzzle"
      onNavigate={onNavigate}
      compact
      titleId="puzzle-title"
      kicker="Tactics"
      title={<><span className="title-upright">Check</span><em>mate</em></>}
      copy="Practice tactical puzzles from the Lichess puzzle database, with ratings, themes, hints and a daily challenge."
      headExtra={
        <button
          type="button"
          className="icon-btn"
          aria-label={soundEnabled ? 'Mute sound' : 'Enable sound'}
          aria-pressed={!soundEnabled}
          onClick={() => { void sound.unlock(); engine.toggleSound(); }}
        >
          <IconVolume muted={!soundEnabled} />
        </button>
      }
      actions={
        <>
          <button type="button" className="btn-ghost" onClick={() => engine.startDaily()}>Daily challenge</button>
          <button type="button" className="begin-game" onClick={() => engine.startRun()}>Begin playing</button>
        </>
      }
    >
      <div className="home-body">
        {loadError && <p className="online-error" role="alert">{loadError}</p>}
        <ul className="feature-list">
          <li><IconOnline className="feature-icon" /><div><strong>Lichess puzzle database</strong><span>Real positions pulled straight from Lichess.</span></div></li>
          <li><IconPuzzle className="feature-icon" /><div><strong>Rated tactics</strong><span>Every puzzle carries a rating, themes and optional hints.</span></div></li>
          <li><IconCalendar className="feature-icon" /><div><strong>Daily challenge</strong><span>A fresh position to solve every day.</span></div></li>
        </ul>
        <p className="home-hint">A single position. A forced line. No room to improvise.</p>
      </div>
      <AchievementsPanel />
    </HomeFrame>
  );
}
