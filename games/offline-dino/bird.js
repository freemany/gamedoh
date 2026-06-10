import { Image, drawShape, getRandomNumber, isCollision } from './gamedoh-engine.js';
import { BIRD_COUNT, OBSTACLE_SPACING } from './constants.js';

// ── Bird sprites (d=black, wings up / wings down) ─────────────────

const BIRD_1 = [
  ['_', '_', '_', '_', '_', 'e', 'e', 'e', '_', '_', '_'],
  ['_', '_', '_', '_', 'e', 'e', '_', '_', '_', '_', '_'],
  ['_', '_', '_', '_', 'e', 'e', '_', '_', '_', 'e', '_'],
  ['_', '_', '_', '_', 'e', 'e', '_', '_', 'e', '_', '_'],
  ['_', 'e', 'e', 'e', 'e', 'e', 'e', 'e', '_', '_', '_'],
  ['e', 'e', 'e', 'e', 'e', 'e', 'e', 'e', 'e', '_', '_'],
  ['_', 'e', 'e', 'e', 'e', 'e', 'e', 'e', 'e', 'e', '_'],
  ['_', '_', '_', 'e', 'e', '_', '_', '_', '_', 'e', '_'],
  ['_', '_', '_', '_', 'e', 'e', '_', '_', '_', '_', 'e'],
  ['_', '_', '_', '_', 'e', 'e', '_', '_', '_', '_', '_'],
];

const BIRD_2 = [
  ['_', '_', '_', '_', '_', '_', '_', '_', '_', '_', '_'],
  ['_', '_', '_', '_', '_', '_', '_', '_', '_', '_', '_'],
  ['_', '_', '_', '_', 'e', 'e', 'e', 'e', '_', 'e', '_'],
  ['_', '_', '_', '_', 'e', 'e', '_', '_', 'e', '_', '_'],
  ['_', 'e', 'e', 'e', 'e', 'e', 'e', 'e', '_', '_', '_'],
  ['e', 'e', 'e', 'e', 'e', 'e', 'e', 'e', 'e', '_', '_'],
  ['_', 'e', 'e', 'e', 'e', 'e', '_', 'e', 'e', 'e', '_'],
  ['_', '_', '_', 'e', 'e', 'e', 'e', '_', '_', 'e', '_'],
  ['_', '_', '_', '_', '_', '_', 'e', 'e', '_', '_', 'e'],
  ['_', '_', '_', '_', '_', '_', '_', '_', '_', '_', '_'],
];

class Bird {
  constructor(game, x) {
    this.game = game;
    this.image = new Image([BIRD_1, BIRD_2]);
    this.width = this.image.getWidth();
    this.height = this.image.getHeight();
    this.x = x;
    this._setHeight();
    this._timer = 0;
  }

  _setHeight() {
    const groundY = this.game.height - this.game.groundHeight;
    // Alternate between high (duck under) and low (jump over)
    this.y = getRandomNumber(2) < 1 ? groundY - this.height - 28 : groundY - this.height - 14;
  }

  _recycle() {
    this.x += BIRD_COUNT * Math.round(OBSTACLE_SPACING * 1.5);
    this._setHeight();
  }

  update() {
    this.x -= this.game.speed;

    if (++this._timer >= 8) {
      this._timer = 0;
      this.image.next();
    }

    if (isCollision(this.game.tRex, this)) {
      this.game.addScore(10);
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
      this.image.getImage(),
      Math.round(this.x) * this.game.blockSize,
      this.y * this.game.blockSize
    );
    return this;
  }
}

export default Bird;
