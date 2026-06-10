import { TILE_SIZE, GRID_OFFSET_Y, FLAME_DURATION } from './constants.js';

class Flame {
  constructor(game, col, row) {
    this.game = game;
    this.col = col;
    this.row = row;
    this.x = game.gridOffsetX + col * TILE_SIZE;
    this.y = GRID_OFFSET_Y + row * TILE_SIZE;
    this.alive = true;
    this._frame = 0;
  }

  update() {
    this._frame++;
    if (this._frame >= FLAME_DURATION) this.alive = false;
  }

  draw(ctx) {
    const alpha = 1 - this._frame / FLAME_DURATION;
    const color = this._frame < 12 ? '#ffffff' : this._frame < 28 ? '#ff9900' : '#ee5533';
    ctx.save();
    ctx.globalAlpha = alpha;
    // Outer glow
    ctx.fillStyle = color;
    ctx.fillRect(this.x + 2, this.y + 2, TILE_SIZE - 4, TILE_SIZE - 4);
    // Inner bright core
    ctx.fillStyle = '#ffffff';
    ctx.globalAlpha = alpha * 0.7;
    ctx.fillRect(this.x + TILE_SIZE / 4, this.y + TILE_SIZE / 4, TILE_SIZE / 2, TILE_SIZE / 2);
    ctx.restore();
  }
}

export default Flame;
