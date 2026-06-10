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
      // _timeUp handled in game._update() — means player ran out of time → game over
      () => { if (!this._done) { this._timeUp = true; } },
    );
  }

  // Called when player scrolls to the level target height
  reachEnd() {
    if (this._done) return;
    this._done  = true;
    this._timeUp = false; // cancel any in-flight time-up
    if (this.index >= LEVELS.length - 1) {
      this.game.win();
    } else {
      this.index++;
      this.game._levelBanner = 90; // 3-second countdown handled in game._update()
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
