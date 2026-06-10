import { drawShape } from '../gamedoh-engine.js';
import { mushroomSprite } from './images.js';
import {
  MUSHROOM_BLOCK_SIZE, MUSHROOM_W, MUSHROOM_H,
  MUSHROOM_SPEED, MUSHROOM_SCORE,
  GRAVITY, CANVAS_HEIGHT, CANVAS_WIDTH, TILE_SIZE, BLOCK_SIZE, WORLD_WIDTH,
} from '../constants.js';
const TS = TILE_SIZE * BLOCK_SIZE; // 64px

class Mushroom {
  constructor(game, pipeX, pipeTopY) {
    this.game = game;
    this.x = pipeX + TS - MUSHROOM_W / 2; // centered in 128px-wide pipe
    this.y = pipeTopY + MUSHROOM_H;        // start hidden inside the pipe
    this.vx = MUSHROOM_SPEED;
    this.vy = 0;
    this.width = MUSHROOM_W;
    this.height = MUSHROOM_H;
    this.alive = true;
    this.emerged = false;
    this.onGround = false;
    this._pipeTopY = pipeTopY;                       // clip boundary during emergence
    this._pipeRightX = pipeX + 2 * TS;              // right edge of pipe collision zone
    this._emergeTargetY = pipeTopY - MUSHROOM_H - 2; // fully above pipe when reached
  }

  update(tiles, mario) {
    if (!this.alive) return;

    // Slide up out of pipe — no physics until fully emerged
    if (!this.emerged) {
      this.y -= 1;
      if (this.y <= this._emergeTargetY) {
        this.emerged = true;
        // Place just outside the pipe so it doesn't land on the pipe top
        this.x = this._pipeRightX + 1;
      }
      return;
    }

    this.onGround = false;

    // Gravity
    this.vy += GRAVITY;

    // Horizontal
    this.x += this.vx;
    this._resolveTilesX(tiles);

    // World boundary bounce
    if (this.x <= 0) { this.x = 0; this.vx = Math.abs(this.vx); }
    if (this.x + this.width >= WORLD_WIDTH) { this.x = WORLD_WIDTH - this.width; this.vx = -Math.abs(this.vx); }

    // Vertical
    this.y += this.vy;
    this._resolveTilesY(tiles);

    // Cliff edge detection
    if (this.onGround) this._checkEdge(tiles);

    // Fall off world
    if (this.y > CANVAS_HEIGHT + 40) { this.alive = false; return; }

    // Mario eats mushroom
    if (!mario._dead && this._overlaps(mario)) {
      this.alive = false;
      this.game.addScore(MUSHROOM_SCORE);
      this.game.playPowerUpSound();
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

    if (!this.emerged) {
      // Clip to only show the part of the mushroom that has emerged above the pipe top
      ctx.save();
      ctx.beginPath();
      ctx.rect(screenX, 0, this.width, this._pipeTopY);
      ctx.clip();
      drawShape(ctx, MUSHROOM_BLOCK_SIZE, mushroomSprite, screenX, this.y);
      ctx.restore();
    } else {
      drawShape(ctx, MUSHROOM_BLOCK_SIZE, mushroomSprite, screenX, this.y);
    }
  }
}

export default Mushroom;
