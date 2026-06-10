import { Level as FrameworkLevel, GameTimer } from './gamedoh-engine.js';
import { LEVELS, HEART_BEAT } from './constants.js';

class Level extends FrameworkLevel {
  constructor(game) {
    super(game, LEVELS, null);
    this._createTimer();
  }

  get duration() { return LEVELS[this.index]; }

  _createTimer() {
    this._done      = false;
    this._timeUp    = false;
    this._remaining = this.duration;
    this.timer = new GameTimer(
      this.duration, HEART_BEAT,
      (remaining) => { if (!this._done) this._remaining = remaining; },
      () => { if (!this._done) { this._timeUp = true; } },
    );
  }

  reachEnd() {
    if (this._done) return;
    this._done   = true;
    this._timeUp = false;
    if (this.index >= LEVELS.length - 1) {
      this.game.win();
    } else {
      this.index++;
      this.game._levelBanner = 90; // 3-second 3-2-1 countdown
    }
  }

  startTimer() { this.timer.start(); }

  reset() {
    this.index = 0;
    this._createTimer();
  }

  draw() {}
}

export default Level;
