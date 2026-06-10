import { WORLD_WIDTH, WORLD_HEIGHT } from './constants.js';

class Bullet {
  constructor(x, y, vx, vy, owner) {
    this.x      = x;
    this.y      = y;
    this.vx     = vx;
    this.vy     = vy;
    this.owner  = owner; // 'player' or 'enemy'
    this.width  = 6;
    this.height = 4;
    this.alive  = true;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    if (this.x < 0 || this.x > WORLD_WIDTH || this.y < 0 || this.y > WORLD_HEIGHT) {
      this.alive = false;
    }
  }

  draw(ctx, cameraX, cameraY = 0) {
    if (!this.alive) return;
    ctx.save();
    ctx.fillStyle = this.owner === 'player' ? '#ffeb3b' : '#ff6d00';
    ctx.fillRect(this.x - cameraX, this.y - cameraY, this.width, this.height);
    ctx.restore();
  }
}

export default Bullet;
