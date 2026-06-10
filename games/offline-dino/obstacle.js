import { drawShape, isCollision } from './gamedoh-engine.js';
import { OBSTACLE_COUNT, OBSTACLE_SPACING } from './constants.js';

// ── Cactus sprites (g=green) ─────────────────────────────────────

const CACTUS_SM = [
  ['_', 'g', 'g', '_', '_'],
  ['_', 'g', 'g', '_', '_'],
  ['g', 'g', 'g', '_', '_'],
  ['g', 'g', 'g', 'g', '_'],
  ['_', '_', 'g', 'g', '_'],
  ['_', '_', 'g', 'g', '_'],
  ['_', '_', 'g', 'g', '_'],
  ['_', '_', 'g', 'g', '_'],
  ['_', '_', 'g', 'g', '_'],
  ['_', '_', 'g', 'g', '_'],
];

const CACTUS_MD = [
  ['_', '_', 'g', '_', '_', '_', '_'],
  ['g', '_', 'g', 'g', '_', '_', '_'],
  ['g', 'g', 'g', 'g', '_', 'g', '_'],
  ['g', 'g', 'g', 'g', 'g', 'g', '_'],
  ['_', '_', 'g', 'g', 'g', 'g', 'g'],
  ['_', '_', '_', 'g', 'g', '_', '_'],
  ['_', '_', '_', 'g', 'g', '_', '_'],
  ['_', '_', '_', 'g', 'g', '_', '_'],
  ['_', '_', '_', 'g', 'g', '_', '_'],
  ['_', '_', '_', 'g', 'g', '_', '_'],
  ['_', '_', '_', 'g', 'g', '_', '_'],
  ['_', '_', '_', 'g', 'g', '_', '_'],
  ['_', '_', '_', 'g', 'g', '_', '_'],
];

const CACTUS_LG = [
  ['_', '_', '_', '_', 'g', 'g', '_', '_', '_'],
  ['_', 'g', '_', '_', 'g', 'g', '_', '_', '_'],
  ['_', 'g', 'g', '_', 'g', 'g', '_', 'g', '_'],
  ['g', 'g', 'g', 'g', 'g', 'g', 'g', 'g', '_'],
  ['_', '_', 'g', 'g', 'g', 'g', 'g', 'g', 'g'],
  ['_', '_', '_', '_', 'g', 'g', 'g', '_', '_'],
  ['_', '_', '_', '_', 'g', 'g', '_', '_', '_'],
  ['_', '_', '_', '_', 'g', 'g', '_', '_', '_'],
  ['_', '_', '_', '_', 'g', 'g', '_', '_', '_'],
  ['_', '_', '_', '_', 'g', 'g', '_', '_', '_'],
  ['_', '_', '_', '_', 'g', 'g', '_', '_', '_'],
  ['_', '_', '_', '_', 'g', 'g', '_', '_', '_'],
  ['_', '_', '_', '_', 'g', 'g', '_', '_', '_'],
  ['_', '_', '_', '_', 'g', 'g', '_', '_', '_'],
  ['_', '_', '_', '_', 'g', 'g', '_', '_', '_'],
  ['_', '_', '_', '_', 'g', 'g', '_', '_', '_'],
];

const SPRITES = [CACTUS_SM, CACTUS_MD, CACTUS_LG];

class Obstacle {
  constructor(game, x) {
    this.game = game;
    this._pick();
    this.x = x;
    this.y = this._groundY();
  }

  _pick() {
    const idx = Math.floor(Math.random() * SPRITES.length);
    this._sprite = SPRITES[idx];
    this.width = this._sprite[0].length;
    this.height = this._sprite.length;
  }

  _groundY() {
    return this.game.height - this.game.groundHeight - this.height;
  }

  _recycle() {
    this.x += OBSTACLE_COUNT * OBSTACLE_SPACING;
    this._pick();
    this.y = this._groundY();
  }

  update() {
    this.x -= this.game.speed;

    if (isCollision(this.game.tRex, this)) {
      this.game.loseLife();
      this._recycle();
      return this;
    }

    if (this.x + this.width <= 0) {
      this._recycle();
    }

    return this;
  }

  draw(ctx) {
    drawShape(
      ctx,
      this.game.blockSize,
      this._sprite,
      Math.round(this.x) * this.game.blockSize,
      this.y * this.game.blockSize
    );
    return this;
  }
}

export default Obstacle;
