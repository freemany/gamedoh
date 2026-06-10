import { Level as FrameworkLevel } from './gamedoh-engine.js';
import { LEVELS } from './constants.js';

class Level extends FrameworkLevel {
  constructor(game) {
    super(game, LEVELS, null);
  }

  get config() {
    return LEVELS[this.index];
  }

  advance() {
    if (this.isLast()) {
      this.game.win();
      return;
    }
    this.index++;
    // onLevelAdvance rebuilds the grid/enemies/player via setupLevel(),
    // which sets _pendingLevelStart → _startLevel() shows LevelIntro → onLevelSetup starts timer
    if (this.game.onLevelAdvance) this.game.onLevelAdvance();
  }

  reset() {
    this.index = 0;
  }
}

export default Level;
