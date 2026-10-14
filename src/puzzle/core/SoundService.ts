export class SoundService {
  private context: AudioContext | null = null;
  private muted = false;

  setMuted(muted: boolean): void {
    this.muted = muted;
  }

  private ensureContext(): AudioContext | null {
    if (this.muted) return null;
    if (!this.context) {
      const AudioCtor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtor) return null;
      this.context = new AudioCtor();
    }
    if (this.context.state === 'suspended') {
      void this.context.resume();
    }
    return this.context;
  }

  private tone(frequency: number, durationMs: number, options: { type?: OscillatorType; gain?: number; delayMs?: number } = {}): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const startAt = ctx.currentTime + (options.delayMs ?? 0) / 1000;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = options.type ?? 'sine';
    osc.frequency.setValueAtTime(frequency, startAt);
    const peak = options.gain ?? 0.08;
    gain.gain.setValueAtTime(0, startAt);
    gain.gain.linearRampToValueAtTime(peak, startAt + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, startAt + durationMs / 1000);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(startAt);
    osc.stop(startAt + durationMs / 1000 + 0.05);
  }

  playMove(): void { this.tone(220, 220, { type: 'sine', gain: 0.05 }); }
  playCapture(): void {
    this.tone(160, 260, { type: 'triangle', gain: 0.07 });
    this.tone(110, 260, { type: 'sine', gain: 0.05, delayMs: 30 });
  }
  playWrong(): void { this.tone(140, 180, { type: 'square', gain: 0.04 }); }
  playCheckmate(): void {
    this.tone(196, 500, { type: 'sine', gain: 0.08 });
    this.tone(294, 600, { type: 'sine', gain: 0.06, delayMs: 140 });
    this.tone(392, 900, { type: 'sine', gain: 0.05, delayMs: 300 });
  }
  playAchievement(): void {
    this.tone(330, 260, { type: 'sine', gain: 0.06 });
    this.tone(440, 420, { type: 'sine', gain: 0.05, delayMs: 160 });
  }
}

export const soundService = new SoundService();
