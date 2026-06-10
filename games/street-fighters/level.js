import { LEVELS } from './constants.js';

class Level {
  constructor(game) {
    this.game = game;
    this.index = 0;
  }

  get config() { return LEVELS[this.index]; }
  get isLast()  { return this.index >= LEVELS.length - 1; }

  advance() {
    if (this.isLast) {
      this.game.win();
      return;
    }
    this.index++;
    if (this.game.onLevelAdvance) this.game.onLevelAdvance();
  }

  reset() {
    this.index = 0;
  }
}

export default Level;
