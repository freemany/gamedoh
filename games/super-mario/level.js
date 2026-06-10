import { Level as FrameworkLevel, GameTimer } from './gamedoh-engine.js';
import { LEVELS, HEART_BEAT, LIVES } from './constants.js';
import { drawLevelTransition } from './screens.js';

class Level extends FrameworkLevel {
  constructor(game) {
    super(game, LEVELS, null);
    this._remaining = LEVELS[0];
    this._createTimer();
  }

  get duration() {
    return LEVELS[this.index];
  }

  _createTimer() {
    this._done = false;
    this._timeUp = false;
    this.timer = new GameTimer(
      this.duration,
      HEART_BEAT,
      (remaining) => {
        if (this._done) return;
        this._remaining = remaining;
      },
      () => {
        if (this._done) return;
        this._done = true;
        this._timeUp = true; // handled in game._update() during active gameplay only
      }
    );
    this._remaining = this.duration;
  }

  // Called when Mario walks to the end of the world
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
    this.index++;
    await drawLevelTransition(this.game, this.number);
    this.game.lives = LIVES;
    this._createTimer();
    this.timer.start();
    if (this.game.onLevelSetup) this.game.onLevelSetup();
  }

  reset() {
    this.index = 0;
    this._createTimer();
  }

  draw() {
    // HUD drawn in game.js drawHUD instead
  }
}

export default Level;
