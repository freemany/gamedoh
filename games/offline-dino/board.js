import Image from './image.js';
import { drawShape } from './utils.js';

const image = [['b', 'b', 'b', 'b', 'b', 'b', 'g', 'g', 'g', 'g', 'g', 'g'], ['b', 'b', 'b', 'b', 'b', 'b', 'g', 'g', 'g', 'g', 'g', 'g']];

class Board {
  constructor(game, {x, y}) {
    this.game = game;
    this.x = x;
    this.y = y;
    this.image = new Image([image]);
    this.width = this.image.getWidth();
    this.height = this.image.getHeight();
    this.speed = 5;
  }

  move(dir) {
    switch (dir) {
      case 'r':
        if (this.x + this.width >= this.game.width) return this;
        this.x += this.speed;
        break;
      case 'l':
        if (this.x <= 0) return this;
        this.x -= this.speed;
        break;
      default:
        break;
    }

   return this;
  }

  update() {
    return this;
  }

  draw(ctx) {
    drawShape(ctx, this.game.blockSize, this.image.getImage(), this.x * this.game.blockSize, this.y * this.game.blockSize);
  }
}

export default Board;
