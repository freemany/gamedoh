import { drawShape } from './gamedoh-engine.js';
import { BLOCK_SIZE } from './constants.js';

export const FLAG_W     = 20 * BLOCK_SIZE; // 40px
export const FLAG_H     = 20 * BLOCK_SIZE; // 40px
export const FLAG_SCORE = 10;

const IMAGE = [
  ['e','e','e','e','e','e','e','e','e','e','e','e','e','e','e','e','e','e','e','e'],
  ['e','d','d','d','d','d','d','d','d','d','d','d','d','d','d','d','d','d','d','e'],
  ['e','d','l','l','l','l','l','l','l','l','l','l','l','l','l','l','l','l','d','e'],
  ['e','d','l','d','d','d','d','d','d','d','d','d','d','d','d','d','d','l','d','e'],
  ['e','d','l','d','r','r','r','l','l','l','l','l','l','r','r','r','d','l','d','e'],
  ['e','d','l','d','r','r','l','l','d','d','d','l','l','l','r','r','d','l','d','e'],
  ['e','d','l','d','r','l','l','d','r','r','r','d','l','l','l','r','d','l','d','e'],
  ['e','d','l','d','l','l','d','r','r','r','r','d','l','l','l','l','d','l','d','e'],
  ['e','d','l','d','l','l','l','l','d','r','r','d','l','l','l','l','d','l','d','e'],
  ['e','d','l','d','d','r','r','r','r','r','r','r','r','r','r','d','d','l','d','e'],
  ['e','d','l','d','l','d','d','r','r','r','r','r','r','d','d','l','d','l','d','e'],
  ['e','d','l','d','l','l','l','l','d','r','r','d','l','l','l','l','d','l','d','e'],
  ['e','d','l','d','l','l','l','l','d','r','r','d','l','l','l','l','d','l','d','e'],
  ['e','d','l','d','r','l','l','d','r','r','r','r','d','l','l','r','d','l','d','e'],
  ['e','d','l','d','r','r','l','d','d','d','d','d','d','l','r','r','d','l','d','e'],
  ['e','d','l','d','r','r','r','l','l','l','l','l','l','r','r','r','d','l','d','e'],
  ['e','d','l','d','d','d','d','d','d','d','d','d','d','d','d','d','d','l','d','e'],
  ['e','d','l','l','l','l','l','l','l','l','l','l','l','l','l','l','l','l','d','e'],
  ['e','d','d','d','d','d','d','d','d','d','d','d','d','d','d','d','d','d','d','e'],
  ['e','e','e','e','e','e','e','e','e','e','e','e','e','e','e','e','e','e','e','e'],
];

class Flag {
  constructor(x, y) {
    this.x      = x;
    this.y      = y;
    this.width  = FLAG_W;
    this.height = FLAG_H;
    this.alive  = true;
  }

  draw(ctx, cameraX, cameraY = 0) {
    if (!this.alive) return;
    ctx.save();
    drawShape(ctx, BLOCK_SIZE, IMAGE, this.x - cameraX, this.y - cameraY);
    ctx.restore();
  }
}

export default Flag;
