import { CANVAS_HEIGHT } from './constants.js';

const BULLET_W = 3;
const BULLET_H = 12;

class Bullet {
  constructor(game, x, y, vy, owner) {
    this.game   = game;
    this.x      = x - BULLET_W / 2;
    this.y      = y;
    this.width  = BULLET_W;
    this.height = BULLET_H;
    this.vy     = vy;
    this.owner  = owner; // 'player' | 'enemy'
    this.alive  = true;
  }

  update() {
    this.y += this.vy;
    if (this.y < -20 || this.y > CANVAS_HEIGHT + 20) this.alive = false;
  }

  draw(ctx) {
    if (!this.alive) return;
    ctx.save();
    ctx.fillStyle = this.owner === 'player' ? '#00ffff' : '#ff4444';
    ctx.fillRect(Math.floor(this.x), Math.floor(this.y), this.width, this.height);
    ctx.restore();
  }
}

export default Bullet;
