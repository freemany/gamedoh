import { GameTimer } from './gamedoh-engine.js';
import { LEVELS, HEART_BEAT, LIVES } from './constants.js';
import { drawLevelTransition } from './screens.js';

class Level {
  constructor(game) {
    this.game = game;
    this.index = 0;
    this._remaining = LEVELS[0];
    this._createTimer();
  }

  get number() {
    return this.index + 1;
  }
  get duration() {
    return LEVELS[this.index];
  }
  isLast() {
    return this.index === LEVELS.length - 1;
  }

  _createTimer() {
    this.timer = new GameTimer(
      this.duration,
      HEART_BEAT,
      (remaining) => {
        this._remaining = remaining;
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

  async _advance() {
    this.index++;
    await drawLevelTransition(this.game, this.number);
    this.game.lives = LIVES;
    this.game.tRex.invincible = 0;
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
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.font = `bold ${blockSize * 3}px monospace`;
    ctx.fillStyle = '#555';
    ctx.fillText(`LVL ${this.number}`, blockSize * 2, blockSize * 5);
    ctx.fillStyle = this._remaining <= 5 ? '#e33' : '#555';
    ctx.fillText(`${this._remaining}s`, blockSize * 2, blockSize * 9);
    ctx.restore();
  }
}

export default Level;
