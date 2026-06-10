import Image from './image.js';
import { drawShape } from './utils.js';

const image = [['d'], ['d']];

class Bullet {
  constructor(game, x, y) {
    this.game = game;
    this.x = x;
    this.y = y;
    this.image = new Image([image]);
    this.width = this.image.getWidth();
    this.height = this.image.getHeight();
    this.deleted = false;
  }

  update() {
    if (this.y < 0) {
      this.deleted = true;
      return this;
    }
    this.y -= 1;

    return this;
  }

  draw(ctx) {
    if (this.deleted) return;
    drawShape(
      ctx,
      this.game.blockSize,
      this.image.getImage(),
      this.x * this.game.blockSize,
      this.y * this.game.blockSize
    );
  }
}

export default Bullet;
