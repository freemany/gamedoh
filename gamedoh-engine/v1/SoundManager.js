class SoundManager {
  constructor() {
    try {
      this._ctx = new (window.AudioContext || window.webkitAudioContext)();
    } catch {
      this._ctx = null;
    }
  }

  _play(freq, duration, type = 'square', vol = 0.15) {
    if (!this._ctx) return;
    try {
      const osc  = this._ctx.createOscillator();
      const gain = this._ctx.createGain();
      osc.connect(gain);
      gain.connect(this._ctx.destination);
      osc.type = type;
      osc.frequency.setValueAtTime(freq, this._ctx.currentTime);
      gain.gain.setValueAtTime(vol, this._ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this._ctx.currentTime + duration);
      osc.start();
      osc.stop(this._ctx.currentTime + duration);
    } catch { /* ignore */ }
  }

  // Ascending fanfare — plays when game starts
  start() {
    this._play(300, 0.08, 'sine', 0.2);
    setTimeout(() => this._play(500, 0.08, 'sine', 0.2),  80);
    setTimeout(() => this._play(700, 0.12, 'sine', 0.2), 160);
  }

  // Short thud — plays on each run step
  step()   { this._play(90, 0.04, 'square', 0.07); }

  // Rising chirp — plays on jump
  jump()   {
    this._play(400, 0.08, 'sine', 0.2);
    setTimeout(() => this._play(600, 0.08, 'sine', 0.15), 60);
  }

  // Buzzing descend — plays on collision / game over
  hit()    {
    this._play(200, 0.15, 'sawtooth', 0.3);
    setTimeout(() => this._play(100, 0.2, 'sawtooth', 0.25), 120);
  }

  // Quick cheerful ping — plays each time speed increases
  levelUp() {
    this._play(880, 0.08, 'sine', 0.2);
    setTimeout(() => this._play(1100, 0.1, 'sine', 0.18), 90);
  }
}

export default SoundManager;
