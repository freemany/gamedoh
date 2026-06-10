import {
  TILE_SIZE,
  GRID_OFFSET_Y,
  BOMB_FUSE_FRAMES,
  TILE_HARD,
  TILE_SOFT,
  TILE_EMPTY,
} from './constants.js';
import Flame from './flame.js';
import { playSound } from './sounds.js';

class Bomb {
  constructor(game, col, row, firePower, owner) {
    this.game = game;
    this.col = col;
    this.row = row;
    this.x = game.gridOffsetX + col * TILE_SIZE;
    this.y = GRID_OFFSET_Y + row * TILE_SIZE;
    this.width = TILE_SIZE;
    this.height = TILE_SIZE;
    this.firePower = firePower;
    this.owner = owner;
    this.alive = true;
    this.isRemote = false;
    this.pierce = false;
    this._fuseTimer = 0;
    this._pulseTimer = 0;
    this._pulse = false; // toggles for pulsing animation
  }

  update() {
    if (this.isRemote) return; // remote bombs only explode on command

    this._fuseTimer++;
    this._pulseTimer++;

    // Pulse faster as fuse runs out
    const pulseInterval = this._fuseTimer < 90 ? 20 : this._fuseTimer < 150 ? 10 : 5;
    if (this._pulseTimer >= pulseInterval) {
      this._pulseTimer = 0;
      this._pulse = !this._pulse;
    }

    if (this._fuseTimer >= BOMB_FUSE_FRAMES) this.explode();
  }

  explode() {
    if (!this.alive) return;
    this.alive = false;
    if (this.owner) this.owner.bombsPlaced = Math.max(0, this.owner.bombsPlaced - 1);

    playSound('explode');
    if (this.game.shake) this.game.shake.trigger();

    // Centre flame
    this.game.flames.push(new Flame(this.game, this.col, this.row));

    // Spread in 4 directions
    const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
    for (const [dc, dr] of dirs) {
      for (let i = 1; i <= this.firePower; i++) {
        const c = this.col + dc * i;
        const r = this.row + dr * i;

        if (c < 0 || c >= this.game.cols || r < 0 || r >= this.game.rows) break;

        const tile = this.game.grid[r][c];
        if (tile === TILE_HARD) break;

        this.game.flames.push(new Flame(this.game, c, r));

        if (tile === TILE_SOFT) {
          this.game.grid[r][c] = TILE_EMPTY;
          this.game._revealAt(c, r);
          if (!this.pierce) break; // normal bombs stop; pierce bombs continue
        }

        // Chain explosion: trigger any bomb caught in this flame
        const chain = this.game.bombs.find(b => b.alive && b.col === c && b.row === r);
        if (chain) {
          chain.explode();
          break;
        }
      }
    }
  }

  draw(ctx) {
    ctx.save();

    const scale = this._pulse ? 1.1 : 0.92;
    const size = TILE_SIZE * scale;
    const ox = this.x + (TILE_SIZE - size) / 2;
    const oy = this.y + (TILE_SIZE - size) / 2;
    const cx = ox + size / 2;
    const cy = oy + size / 2;
    const radius = (size / 2) * 0.72;

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.ellipse(cx + 2, cy + 4, radius * 0.9, radius * 0.4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Bomb body
    ctx.fillStyle = '#222222';
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fill();

    // Highlight
    ctx.fillStyle = '#555555';
    ctx.beginPath();
    ctx.arc(cx - radius * 0.25, cy - radius * 0.25, radius * 0.3, 0, Math.PI * 2);
    ctx.fill();

    // Fuse line
    const fuseX = cx + radius * 0.6;
    const fuseY = cy - radius * 0.6;
    ctx.strokeStyle = '#cc8800';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(fuseX, fuseY);
    ctx.quadraticCurveTo(fuseX + 8, fuseY - 12, fuseX + 4, fuseY - 22);
    ctx.stroke();

    // Fuse spark
    const sparkColor = this._pulse ? '#ffff00' : '#ff8800';
    ctx.fillStyle = sparkColor;
    ctx.beginPath();
    ctx.arc(fuseX + 4, fuseY - 22, 4, 0, Math.PI * 2);
    ctx.fill();

    // Countdown number (3 → 2 → 1)
    const framesLeft = BOMB_FUSE_FRAMES - this._fuseTimer;
    const count = Math.ceil(framesLeft / (BOMB_FUSE_FRAMES / 3));
    if (count >= 1 && count <= 3) {
      ctx.fillStyle = count === 1 ? '#ff2200' : count === 2 ? '#ffaa00' : '#ffffff';
      ctx.font = `bold ${Math.round(radius * 1.1)}px monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(String(count), cx, cy + radius * 0.05);
    }

    ctx.restore();
  }
}

export default Bomb;
