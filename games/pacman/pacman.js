import Shape from './shape.js';
import imageArr from './pacmanImage.js';
import { checkHitBlocks } from './helper.js';
import { isCollision } from './utils.js';

const UP = 0;
const RIGHT = 1;
const DOWN = 2;
const LEFT = 3;

class Pacman extends Shape {
  constructor(game, { x, y }) {
    super(game, imageArr);
    this.x = x;
    this.y = y;
    this.speed = 2;
  }

  move(dir) {
    this.image.next();
    switch (dir) {
      case 'up':
        if (checkHitBlocks(this.game.maze, { ...this, y: this.y - 1 })) return;
        this.image.setYIndex(UP);
        this.y -= this.speed;
        break;
      case 'right':
        if (checkHitBlocks(this.game.maze, { ...this, x: this.x + 1 })) return;
        this.image.setYIndex(RIGHT);
        this.x += this.speed;
        break;
      case 'down':
        if (checkHitBlocks(this.game.maze, { ...this, y: this.y + 1 })) return;
        this.image.setYIndex(DOWN);
        this.y += this.speed;
        break;
      case 'left':
        if (checkHitBlocks(this.game.maze, { ...this, x: this.x - 1 })) return;
        this.image.setYIndex(LEFT);
        this.x -= this.speed;
        break;
      default:
        break;
    }
  }

  update() {
    if (this.game.ghosts.some((ghost) => isCollision(this, ghost, 3))) {
      --this.game.board.life;
      if (this.game.board.life === 0) {
        return this;
      }
      this.x = this.game.pacmanStart.x;
      this.y = this.game.pacmanStart.y;
    }

    return this;
  }
}

export default Pacman;
