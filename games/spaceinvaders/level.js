import { LEVELS, LEVEL_TIMEOUT } from './constants.js';
import Countdown from './countdown.js';
import LevelIntro from './levelIntro.js';

class Level {
  constructor(game) {
    this.game = game;
    this.index = 0;
  }

  get number() {
    return this.index + 1;
  }

  get alienCount() {
    return LEVELS[this.index];
  }

  isLast() {
    return this.index === LEVELS.length - 1;
  }

  async next() {
    this.index++;
    if (this.game.onLevelSetup) {
      this.game.transitioning = true;
      await new LevelIntro(this.game, this.number).start();
      await new Countdown(this.game, LEVEL_TIMEOUT / 1000).start();
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
