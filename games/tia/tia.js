import Shape from './shape.js';
import imageArr from './tiaImage.js';
const LEFT = 0;
const RIGHT = 1;
const JUMP = 2;
const JUMP_START = 0;
const JUMP_HIGHT = 1;

class Tia extends Shape {
  constructor(game, { x, y }) {
    super(game, imageArr);
    this.x = x;
    this.y = y;
    this.jumpingCount = null;
    this.jumpingMaxStep = 2;
    this.jumpingHeight = 9;
  }

  move(dir) {
    if (this.jumpingCount !== null) {
      return;
    }
    switch (dir) {
      case 'up':
        this.jumpingCount = 0;
        this.image.setYIndex(JUMP);
        this.image.setXIndex(JUMP_START);
        break;
      case 'right':
        if (this.x + this.width >= this.game.width) return;
        this.x++;
        if (this.image.getYIndex() !== RIGHT) {
          this.image.setYIndex(RIGHT);
          return;
        }
        this.image.next();
        break;
      case 'left':
        if (this.x <= 0) return;
        this.x--;
        if (this.image.getYIndex() !== LEFT) {
          this.image.setYIndex(LEFT);
          return;
        }
        this.image.next();
        break;
      default:
        break;
    }
  }

  ifJump() {
    if (this.jumpingCount !== null) {
      if (this.jumpingCount === JUMP_START) {
        this.jumpingCount++;
        this.y -= this.jumpingHeight;
        return;
      }
      if (this.jumpingCount === JUMP_HIGHT) {
        this.image.setXIndex(JUMP_HIGHT);
        this.jumpingCount++;
        return;
      }
      if (this.jumpingCount >= this.jumpingMaxStep) {
        this.jumpingCount = null;
        this.y += this.jumpingHeight;
        this.image.setXIndex(JUMP_START);
      }
    }
  }

  update() {
    this.ifJump();
    return this;
  }
}

export default Tia;
