import { Level as FrameworkLevel } from './gamedoh-engine.js';
import { GameTimer } from './gamedoh-engine.js';
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
    this.timer = new GameTimer(
      this.duration,
      HEART_BEAT,
      (remaining) => {
        this._remaining = remaining;
        this.game.addScore(1);
      },
      () => {
        if (this.isLast()) {
          this.game.win();
        } else {
          this._advance();
        }
      }
    );
    this._remaining = this.duration;
  }

  // Override next() to use race-car transition instead of LevelIntro + Countdown
  async _advance() {
    this.index++;
    await drawLevelTransition(this.game, this.number);
    this.game.lives = LIVES;
    this.game.playerCar.invincible = 0;
    this._createTimer();
    this.timer.start();
    if (this.game.onLevelSetup) this.game.onLevelSetup();
  }

  reset() {
    this.index = 0;
    this._createTimer();
  }

  draw() {
    const { ctx, blockSize } = this.game;
    ctx.save();
    ctx.textAlign = 'right';
    ctx.textBaseline = 'top';
    ctx.font = `bold ${blockSize * 3}px monospace`;
    ctx.fillStyle = '#fff';
    ctx.fillText(`LVL ${this.number}`, this.game.width * blockSize - blockSize * 2, blockSize * 5);
    ctx.fillStyle = this._remaining <= 3 ? '#e33' : '#fff';
    ctx.fillText(`${this._remaining}s`, this.game.width * blockSize - blockSize * 2, blockSize * 9);
    ctx.restore();
  }
}

export default Level;
