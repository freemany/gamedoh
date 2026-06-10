import { PLATFORM_H } from './constants.js';

class Platform {
  constructor(x, y, w) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = PLATFORM_H;
    this.alive = true;
  }

  draw(ctx) {
    ctx.save();
    ctx.fillStyle = '#2ecc71';
    ctx.strokeStyle = '#27ae60';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(this.x, this.y, this.w, this.h, 6);
    ctx.fill();
    ctx.stroke();
    // Shine highlight
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.beginPath();
    ctx.roundRect(this.x + 5, this.y + 2, this.w - 10, 4, 2);
    ctx.fill();
    ctx.restore();
  }
}

export default Platform;
