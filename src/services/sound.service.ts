/**
 * SoundService
 * High-performance Web Audio API synthesizer for sound effects and jingles.
 */
class SoundService {
  private ctx: AudioContext | null = null;
  private isMuted = false;

  constructor() {
    // Read persisted sound state
    try {
      const saved = localStorage.getItem('arcade_sound_enabled');
      if (saved !== null) {
        this.isMuted = saved === 'false';
      }
    } catch {
      this.isMuted = false;
    }
  }

  private initContext() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public getSoundEnabled(): boolean {
    return !this.isMuted;
  }

  public toggleSound(): boolean {
    this.isMuted = !this.isMuted;
    try {
      localStorage.setItem('arcade_sound_enabled', String(!this.isMuted));
    } catch {}
    if (!this.isMuted) {
      this.playTileSelect(0);
    }
    return !this.isMuted;
  }

  public playTone(freq: number, type: OscillatorType = 'sine', duration = 0.1, gainVal = 0.15) {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      gain.gain.setValueAtTime(gainVal, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch {}
  }

  public playTileSelect(index = 0) {
    const freqs = [329.63, 392.00, 493.88, 587.33];
    this.playTone(freqs[index % 4], 'triangle', 0.08, 0.12);
  }

  public playUntap() {
    this.playTone(220, 'sine', 0.05, 0.08);
  }

  public playCorrect() {
    this.playTone(523.25, 'triangle', 0.08, 0.15); // C5
    setTimeout(() => this.playTone(659.25, 'triangle', 0.1, 0.15), 60); // E5
    setTimeout(() => this.playTone(783.99, 'triangle', 0.15, 0.2), 120); // G5
  }

  public playCombo() {
    this.playTone(587.33, 'triangle', 0.08, 0.15);
    setTimeout(() => this.playTone(739.99, 'triangle', 0.1, 0.18), 60);
    setTimeout(() => this.playTone(880.00, 'triangle', 0.12, 0.22), 120);
    setTimeout(() => this.playTone(1174.66, 'triangle', 0.18, 0.25), 180);
  }

  public playWrong() {
    this.playTone(180, 'sawtooth', 0.15, 0.2);
    setTimeout(() => this.playTone(140, 'sawtooth', 0.2, 0.25), 80);
  }

  public playGameOver() {
    this.playTone(300, 'sawtooth', 0.2, 0.2);
    setTimeout(() => this.playTone(240, 'sawtooth', 0.2, 0.2), 120);
    setTimeout(() => this.playTone(180, 'sawtooth', 0.35, 0.25), 240);
  }

  public playGameStart() {
    this.playTone(440, 'triangle', 0.1, 0.15);
    setTimeout(() => this.playTone(554.37, 'triangle', 0.1, 0.15), 70);
    setTimeout(() => this.playTone(659.25, 'triangle', 0.15, 0.2), 140);
  }

  public playKeyPress(index = 0) {
    this.playTileSelect(index);
  }

  public playKeyDelete() {
    this.playUntap();
  }

  public playWordSuccess() {
    this.playCorrect();
  }

  public playWordWrong() {
    this.playWrong();
  }

  public playStreakMilestone() {
    this.playCombo();
  }

  public playToggle() {
    this.playTone(440, 'sine', 0.05, 0.08);
  }
}

export const soundService = new SoundService();
