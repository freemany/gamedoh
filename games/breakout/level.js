import { Level as FrameworkLevel, LevelIntro } from './gamedoh-engine.js';
import { LEVELS } from './constants.js';

class Level extends FrameworkLevel {
  constructor(game) {
    super(game, LEVELS, null);
  }

  get rows() {
    return LEVELS[this.index].rows;
  }

  get speed() {
    return LEVELS[this.index].speed;
  }

  async advance() {
    if (this.isLast()) {
      this.game.win();
      return;
    }
    this.index++;
    this.game._transitioning = true;
    await new LevelIntro(this.game, this.index + 1).start();
    if (this.game.onLevelSetup) this.game.onLevelSetup();
    this.game._transitioning = false;
  }

  reset() {
    this.index = 0;
  }
}

export default Level;
