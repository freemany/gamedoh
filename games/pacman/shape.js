import Image from './image.js';
import { drawShape } from './utils.js';

class Shape {
  constructor(game, imageArr) {
    this.game = game;
    this.image = new Image(imageArr);
    this.width = this.image.getWidth();
    this.height = this.image.getHeight();
    this.deleted = false;
  }

  move(dir) {
    return this;
  }

  update() {
    return this;
  }

  draw(ctx) {
    drawShape(
      ctx,
      this.game.blockSize,
      this.image.getImage(),
      this.x * this.game.blockSize,
      this.y * this.game.blockSize
    );
  }
}

export default Shape;
