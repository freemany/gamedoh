import { Level as FrameworkLevel, GameTimer, LevelIntro } from './gamedoh-engine.js';
import { LEVELS, HEART_BEAT } from './constants.js';

class Level extends FrameworkLevel {
  constructor(game) {
    super(game, LEVELS, null);
    this._createTimer();
  }

  get carrotCount() { return LEVELS[this.index].carrotCount; }
  get timeLimit()   { return LEVELS[this.index].timeLimit; }

  _createTimer() {
    this._done = false;
    this._timeUp = false;
    this._remaining = this.timeLimit;
    this.timer = new GameTimer(
      this.timeLimit,
      HEART_BEAT,
      (remaining) => { if (!this._done) this._remaining = remaining; },
      () => { if (!this._done) { this._done = true; this._timeUp = true; } }
    );
  }

  reachEnd() {
    if (this._done) return;
    this._done = true;
    if (this.isLast()) {
      this.game.win();
    } else {
      this._advance();
    }
  }

  async _advance() {
    this.game._transitioning = true;
    this.index++;
    this._createTimer();
    await new LevelIntro(this.game, this.index + 1).start();
    if (this.game.onLevelSetup) this.game.onLevelSetup();
    this.timer.start();
    this.game._transitioning = false;
  }

  reset() {
    this.index = 0;
    this._createTimer();
  }

  draw() {}
}

export default Level;
