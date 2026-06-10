import { Level as FrameworkLevel } from './gamedoh-engine.js';
import { LEVELS } from './constants.js';

class Level extends FrameworkLevel {
  constructor(game) {
    super(game, LEVELS, null);
  }

  get config() {
    return LEVELS[Math.min(this.index, LEVELS.length - 1)];
  }

  get isChallengingStage() {
    return this.config.challenging;
  }

  advance() {
    if (this.isLast()) {
      this.game.win();
      return;
    }
    this.index++;
    if (this.game.onLevelAdvance) this.game.onLevelAdvance(); // rebuilds enemies + sets _pendingLevelStart
  }

  reset() {
    this.index = 0;
  }
}

export default Level;
