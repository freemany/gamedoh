import { drawShape } from '../gamedoh-engine.js';
import { BLOCK_SIZE, BULLET_SPEED } from '../constants.js';
import Bullet from '../bullet.js';
import { playSound } from '../sounds.js';
import { CANNON_RIGHT, CANNON_UP, CANNON_LEFT, CANNON_DOWN } from './images.js';

export const CANNON_W     = 20 * BLOCK_SIZE; // 40px
export const CANNON_H     = 20 * BLOCK_SIZE; // 40px
export const CANNON_SCORE = 5;

const DIRS   = ['right', 'left', 'up', 'down'];
const IMAGES = { right: CANNON_RIGHT, up: CANNON_UP, left: CANNON_LEFT, down: CANNON_DOWN };

class Cannon {
  constructor(game, x, y) {
    this.game      = game;
    this.x         = x;
    this.y         = y;
    this.width     = CANNON_W;
    this.height    = CANNON_H;
    this.direction = DIRS[Math.floor(Math.random() * 4)];
    this.alive     = true;
    this._shootTimer    = Math.floor(Math.random() * 90);
    this._shootInterval = 90 + Math.floor(Math.random() * 60);
    this._rotateTimer    = Math.floor(Math.random() * 60);
    this._rotateInterval = 60 + Math.floor(Math.random() * 60);
  }

  update(bullets) {
    if (!this.alive) return;

    // Rotate to a new random direction periodically
    if (++this._rotateTimer >= this._rotateInterval) {
      this._rotateTimer    = 0;
      this._rotateInterval = 60 + Math.floor(Math.random() * 60);
      this.direction = DIRS[Math.floor(Math.random() * 4)];
    }

    // Shoot in current direction
    if (++this._shootTimer >= this._shootInterval) {
      this._shootTimer    = 0;
      this._shootInterval = 90 + Math.floor(Math.random() * 60);
      this._shoot(bullets);
    }
  }

  _shoot(bullets) {
    const cx = this.x + this.width  / 2;
    const cy = this.y + this.height / 2;
    let vx = 0, vy = 0, bx = cx, by = cy;
    switch (this.direction) {
      case 'right': vx =  BULLET_SPEED; bx = this.x + this.width;   by = cy; break;
      case 'left':  vx = -BULLET_SPEED; bx = this.x;                by = cy; break;
      case 'up':    vy = -BULLET_SPEED; bx = cx; by = this.y;               break;
      case 'down':  vy =  BULLET_SPEED; bx = cx; by = this.y + this.height; break;
    }
    bullets.push(new Bullet(bx, by, vx, vy, 'enemy'));
    playSound('shoot');
  }

  draw(ctx, cameraX, cameraY = 0) {
    if (!this.alive) return;
    ctx.save();
    drawShape(ctx, BLOCK_SIZE, IMAGES[this.direction], this.x - cameraX, this.y - cameraY);
    ctx.restore();
  }
}

export default Cannon;
