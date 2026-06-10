import { drawShape } from './gamedoh-engine.js';
import { BLOCK_SIZE } from './constants.js';

export const PICKUP_W = 20 * BLOCK_SIZE; // 40px
export const PICKUP_H = 20 * BLOCK_SIZE; // 40px
export const PICKUP_SCORE = 10;

const IMAGE = [
  ['e','e','e','e','e','e','e','e','e','e','e','e','e','e','e','e','e','e','e','e'],
  ['e','d','d','d','d','d','d','d','d','d','d','d','d','d','d','d','d','d','e','e'],
  ['e','d','l','l','l','l','l','l','l','l','l','l','l','l','d','l','l','d','e','e'],
  ['e','d','l','l','l','d','d','d','d','d','d','d','d','d','l','d','l','d','e','e'],
  ['e','d','l','d','d','d','l','l','l','l','l','l','l','d','l','l','l','d','e','e'],
  ['e','d','d','d','l','l','l','l','l','d','d','l','l','d','l','l','l','d','e','e'],
  ['e','d','l','l','l','d','d','l','l','l','l','l','l','d','l','l','l','d','e','e'],
  ['e','d','l','d','l','d','r','l','l','l','l','l','l','d','d','d','d','d','d','d'],
  ['e','d','l','d','l','d','r','l','l','r','r','r','l','l','l','r','l','l','d','d'],
  ['e','d','l','d','l','d','r','l','l','r','r','r','l','l','l','r','l','l','d','d'],
  ['e','d','l','d','l','d','r','l','l','r','r','r','l','l','l','r','l','l','d','d'],
  ['e','d','l','d','l','d','r','l','l','l','l','l','l','d','d','d','d','d','d','d'],
  ['e','d','l','l','l','d','d','l','l','l','l','l','l','d','l','l','l','d','e','e'],
  ['e','d','d','d','l','l','l','l','l','d','d','l','l','d','l','l','l','d','e','e'],
  ['e','d','l','d','d','d','l','l','l','l','l','l','l','d','l','l','l','d','e','e'],
  ['e','d','l','l','l','d','d','d','d','d','d','d','d','d','l','d','l','d','e','e'],
  ['e','d','l','l','l','l','l','l','l','l','l','l','l','l','d','l','l','d','e','e'],
  ['e','d','l','l','l','l','l','l','l','l','l','l','l','l','l','l','l','d','e','e'],
  ['e','d','d','d','d','d','d','d','d','d','d','d','d','d','d','d','d','d','e','e'],
  ['e','e','e','e','e','e','e','e','e','e','e','e','e','e','e','e','e','e','e','e'],
];

class Pickup {
  constructor(x, y) {
    this.x      = x;
    this.y      = y;
    this.width  = PICKUP_W;
    this.height = PICKUP_H;
    this.alive  = true;
  }

  draw(ctx, cameraX) {
    if (!this.alive) return;
    ctx.save();
    drawShape(ctx, BLOCK_SIZE, IMAGE, this.x - cameraX, this.y);
    ctx.restore();
  }
}

export default Pickup;
