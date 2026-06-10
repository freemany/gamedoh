import LevelIntro from '../LevelIntro.js';
import Countdown from './Countdown.js';
import GameTimer from './GameTimer.js';

// LEVELS is an array of alien counts per level, e.g. [3, 6, 9]
// LEVEL_TIMEOUT is the countdown duration in ms, e.g. 3000
class Level {
  constructor(game, levels, levelTimeout) {
    this.game = game;
    this.levels = levels;
    this.levelTimeout = levelTimeout;
    this.index = 0;
    this.timeRemaining = 0;
    this._timer = null;
  }

  get number() {
    return this.index + 1;
  }

  get alienCount() {
    return this.levels[this.index].carrotCount;
  }

  get timeLimit() {
    return this.levels[this.index].timeLimit;
  }

  isLast() {
    return this.index === this.levels.length - 1;
  }

  startTimer(seconds, heartbeat, onExpire) {
    this.cancelTimer();
    this.timeRemaining = seconds;
    this._timer = new GameTimer(seconds, heartbeat, (remaining) => {
      this.timeRemaining = remaining;
    }, onExpire);
    this._timer.start();
  }

  updateTimer() {
    if (this._timer) this._timer.update();
  }

  cancelTimer() {
    if (this._timer) this._timer.cancel();
  }

  async next() {
    this.cancelTimer();
    this.index++;
    if (this.game.onLevelSetup) {
      this.game.transitioning = true;
      await new LevelIntro(this.game, this.number).start();
      await new Countdown(this.game, this.levelTimeout / 1000).start();
      this.game.onLevelSetup(this.alienCount);
      this.game.transitioning = false;
    }
  }

  reset() {
    this.index = 0;
  }

  draw() {
    const { ctx, blockSize, width } = this.game;
    ctx.save();
    ctx.fillStyle = 'Black';
    ctx.font = '20px Arial';
    ctx.textAlign = 'right';
    ctx.fillText(`Level ${this.number}`, (width - 2) * blockSize, 3 * blockSize);
    ctx.restore();
  }
}

export default Level;
