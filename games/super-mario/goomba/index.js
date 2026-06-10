import { drawShape } from '../gamedoh-engine.js';
import { goombaA, goombaB, goombaFlat } from './images.js';
import {
  GOOMBA_BLOCK_SIZE, GRAVITY, GOOMBA_SPEED, GOOMBA_W, GOOMBA_H,
  CANVAS_HEIGHT, CANVAS_WIDTH, STOMP_SCORE, WORLD_WIDTH,
} from '../constants.js';

class Goomba {
  constructor(game, startX) {
    this.game = game;
    this.x = startX;
    this.y = CANVAS_HEIGHT - 64 - GOOMBA_H;
    this.vx = -GOOMBA_SPEED;
    this.vy = 0;
    this.width = GOOMBA_W;
    this.height = GOOMBA_H;
    this.alive = true;
    this.flat = false;
    this.onGround = false;
    this._flatTimer = 0;
    this._animTimer = 0;
    this._frame = 0;
  }

  update(tiles, cameraX, mario) {
    if (this.flat) {
      this._flatTimer++;
      if (this._flatTimer > 30) this.alive = false;
      return;
    }
    if (!this.alive) return;

    // Only update if near camera view
    const screenX = this.x - cameraX;
    if (screenX < -CANVAS_WIDTH || screenX > CANVAS_WIDTH * 2) return;

    this.onGround = false;

    // Gravity
    this.vy += GRAVITY;

    // Horizontal move
    this.x += this.vx;
    this._resolveTilesX(tiles);

    // World boundary bounce
    if (this.x <= 0) { this.x = 0; this.vx = Math.abs(this.vx); }
    if (this.x + this.width >= WORLD_WIDTH) { this.x = WORLD_WIDTH - this.width; this.vx = -Math.abs(this.vx); }

    // Vertical move
    this.y += this.vy;
    this._resolveTilesY(tiles);

    // Cliff edge detection — reverse before stepping off
    if (this.onGround) this._checkEdge(tiles);

    // Fall into pit — remove
    if (this.y > CANVAS_HEIGHT + 40) { this.alive = false; return; }

    // Animate walk
    if (++this._animTimer >= 10) {
      this._animTimer = 0;
      this._frame = this._frame === 0 ? 1 : 0;
    }

    // Stomp check
    if (mario._dead) return;
    if (this._overlaps(mario)) {
      const marioBottom = mario.y + mario.height;
      const goombaTop = this.y;
      if (mario.vy > 0 && marioBottom < goombaTop + 20) {
        this.flat = true;
        mario.vy = -6;
        this.game.addScore(STOMP_SCORE);
      } else if (!mario.flash?.active) {
        mario.die();
      }
    }
  }

  _resolveTilesX(tiles) {
    tiles.forEach((tile) => {
      if (!this._overlaps(tile)) return;
      this.vx = -this.vx;
      this.x += this.vx * 2;
    });
  }

  _resolveTilesY(tiles) {
    tiles.forEach((tile) => {
      if (!this._overlaps(tile)) return;
      if (this.vy > 0) {
        this.y = tile.y - this.height;
        this.vy = 0;
        this.onGround = true;
      } else if (this.vy < 0) {
        this.y = tile.y + tile.h;
        this.vy = 0;
      }
    });
  }

  // Reverse direction if there's no ground 1px ahead of the front edge
  _checkEdge(tiles) {
    const probeX = this.vx > 0 ? this.x + this.width + 2 : this.x - 2;
    const probeY = this.y + this.height + 1;
    const hasGround = tiles.some(
      (t) => probeX >= t.x && probeX < t.x + t.w && probeY >= t.y && probeY < t.y + t.h
    );
    if (!hasGround) this.vx = -this.vx;
  }

  _overlaps(obj) {
    const ow = obj.w ?? obj.width;
    const oh = obj.h ?? obj.height;
    return (
      this.x < obj.x + ow &&
      this.x + this.width > obj.x &&
      this.y < obj.y + oh &&
      this.y + this.height > obj.y
    );
  }

  draw(ctx, cameraX) {
    if (!this.alive) return;
    const screenX = this.x - cameraX;
    if (screenX < -this.width || screenX > CANVAS_WIDTH + this.width) return;
    const sprite = this.flat ? goombaFlat : (this._frame === 0 ? goombaA : goombaB);
    drawShape(ctx, GOOMBA_BLOCK_SIZE, sprite, screenX, this.y);
  }
}

export default Goomba;
