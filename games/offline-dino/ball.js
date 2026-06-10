import Image from './image.js';
import { drawShape, getRandom } from './utils.js';

const image = [ [ 'r' ] ];

class Ball {
  constructor(game, { x, y, xSpeed, ySpeed }) {
    this.game = game;
    this.image = new Image([image]);
    this.width = this.image.getWidth();
    this.height = this.image.getHeight();

    this.x = x;
    this.y = y;
    this.xSpeed = xSpeed;
    this.ySpeed = ySpeed;

    this.skipFrames = 5;
  }

  update() {
    if (this.game.frame % this.skipFrames > 0 ) return this;

    this.x += this.xSpeed;
    this.y += this.ySpeed;

    if (this.y + this.height > this.game.height) {
      this.game.over();

      return this;
    }
    if (this.y <= 0) {
      this.ySpeed *= -1;
      this.y += this.ySpeed;

      return this;
    }

    if (this.x + this.width >= this.game.width || this.x <= 0) {
      this.xSpeed *= -1;
      this.x += this.xSpeed;

      return this;
    }

    // Bounce on board
    if (this.y + this.height >= this.game.board.y && this.x >= this.game.board.x) {
      if (this.x <= this.game.board.x + this.game.board.width / 2) {
        this.ySpeed = -1;
        this.skipFrames = getRandom(3) + 2;
        return this;
     }
      if (this.x <= this.game.board.x + this.game.board.width) {
        this.ySpeed = -2;
        this.skipFrames = 5;
        return this;
     }
    }

    return this;
  }

  draw(ctx) {
     drawShape(ctx, this.game.blockSize, this.image.getImage(), this.x * this.game.blockSize, this.y * this.game.blockSize);
  }
}

export default Ball;
