import { BRICK_W, BRICK_H } from './constants.js';

class Brick {
  constructor(x, y, color) {
    this.x = x;
    this.y = y;
    this.width = BRICK_W;
    this.height = BRICK_H;
    this.color = color;
    this.alive = true;
  }

  draw(ctx) {
    if (!this.alive) return;
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.width, this.height);
    // highlight strip
    ctx.fillStyle = 'rgba(255,255,255,0.25)';
    ctx.fillRect(this.x, this.y, this.width, 4);
    // shadow strip
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.fillRect(this.x, this.y + this.height - 4, this.width, 4);
  }
}

export default Brick;
