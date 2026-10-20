import { sound } from '../../sound';

/**
 * Puzzle sounds now come from the shared Woodland sound engine (felted-wood
 * piece taps, soft chimes), so every mode sounds the same and one mute switch
 * covers the whole app. The method names are unchanged for GameEngine.
 */
export class SoundService {
  /** Muting here mutes everywhere. */
  setMuted(muted: boolean): void {
    sound.setEnabled(!muted);
  }

  playMove(): void { sound.play('move'); }
  playCapture(): void { sound.play('capture'); }
  playWrong(): void { sound.play('wrong'); }
  playCheckmate(): void { sound.play('win'); }
  playAchievement(): void { sound.play('achievement'); }
}

export const soundService = new SoundService();
