import Shape from './shape.js';
import { checkHitBlocks, toRandomColor, ghostEyes } from './helper.js';
import { getRandom } from './utils.js';

const image = [
  ['_', '_', '_', 'i', 'i', 'i', 'i', '_', '_', '_'],
  ['_', '_', 'i', 'i', 'i', 'i', 'i', 'i', '_', '_'],
  ['_', 'i', 'i', 'i', 'i', 'i', 'i', 'i', 'i', '_'],
  ['i', 'i', 'i', 'w', 'd', 'i', 'w', 'd', 'i', 'i'],
  ['i', 'i', 'i', 'w', 'd', 'i', 'w', 'd', 'i', 'i'],
  ['i', 'i', 'i', 'w', 'd', 'i', 'w', 'd', 'i', 'i'],
  ['i', 'i', 'i', 'i', 'i', 'i', 'i', 'i', 'i', 'i'],
  ['i', 'i', 'i', 'i', 'i', 'i', 'i', 'i', 'i', 'i'],
  ['i', 'i', '_', 'i', 'i', 'i', 'i', '_', 'i', 'i'],
  ['i', '_', '_', '_', 'i', 'i', '_', '_', '_', 'i'],
];
const image1 = [
  ['_', '_', '_', 'i', 'i', 'i', 'i', '_', '_', '_'],
  ['_', '_', 'i', 'i', 'i', 'i', 'i', 'i', '_', '_'],
  ['_', 'i', 'i', 'i', 'i', 'i', 'i', 'i', 'i', '_'],
  ['i', 'i', 'd', 'w', 'i', 'd', 'w', 'i', 'i', 'i'],
  ['i', 'i', 'd', 'w', 'i', 'd', 'w', 'i', 'i', 'i'],
  ['i', 'i', 'd', 'w', 'i', 'd', 'w', 'i', 'i', 'i'],
  ['i', 'i', 'i', 'i', 'i', 'i', 'i', 'i', 'i', 'i'],
  ['i', 'i', 'i', 'i', 'i', 'i', 'i', 'i', 'i', 'i'],
  ['_', 'i', 'i', 'i', '_', '_', 'i', 'i', 'i', '_'],
  ['_', 'i', 'i', '_', '_', '_', '_', 'i', 'i', '_'],
];

class Ghost extends Shape {
  constructor(game, { x, y, xSpeed, ySpeed }) {
    const images = toRandomColor([[image, image1]], 'i');
    super(game, images);
    this.x = x;
    this.y = y;
    this.xSpeed = xSpeed;
    this.ySpeed = ySpeed;
  }

  _checkTurning() {
    const turningChance = ghostEyes[`${this.x}-${this.y}`];
    if (turningChance && getRandom(5) > 3) {
      if (this.ySpeed === 0) {
        const yChance = turningChance.y[getRandom(turningChance.y.length)];
        this.ySpeed = Math.abs(this.xSpeed) * yChance;
        this.xSpeed = 0;

        return;
      }
      if (this.xSpeed === 0) {
        const xChance = turningChance.x[getRandom(turningChance.x.length)];
        this.xSpeed = Math.abs(this.ySpeed) * xChance;
        this.ySpeed = 0;
      }
    }
  }

  update() {
    this.image.next();
    if (checkHitBlocks(this.game.maze, this)) {
      this.xSpeed *= -1;
      this.ySpeed *= -1;
    }
    this._checkTurning();
    this.x += this.xSpeed;
    this.y += this.ySpeed;

    return this;
  }
}

export default Ghost;
