import { drawShape } from '../utils.js';
import Image from './Image.js';

class PixelButton {
  constructor({ x, y, game, imageArr }) {
    this.image = new Image([imageArr]);
    this.width = this.image.getWidth();
    this.height = this.image.getHeight();
    this.x = x;
    this.y = y;
    this.game = game;
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

  isClicked(clickX, clickY) {
    const x = this.x * this.game.blockSize;
    const y = this.y * this.game.blockSize;
    const w = this.width * this.game.blockSize;
    const h = this.height * this.game.blockSize;
    return clickX >= x && clickX <= x + w && clickY >= y && clickY <= y + h;
  }
}

export default PixelButton;
