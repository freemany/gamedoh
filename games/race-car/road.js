import { drawShape } from './gamedoh-engine.js';
import { border } from './images.js';
import { CANVAS_WIDTH, CANVAS_HEIGHT, BLOCK_SIZE } from './constants.js';

// Road layout (pixels):
// Left border:  x 0–25
// Road:         x 25–455
// Right border: x 455–480
// Lane dividers at x ≈ 168 and x ≈ 312

const BORDER_PX = 5 * BLOCK_SIZE; // 25px
const DIVIDER_1_X = 168;
const DIVIDER_2_X = 312;
const DASH_H = 20;
const GAP_H = 20;
const PERIOD = DASH_H + GAP_H;

class Road {
  constructor(game) {
    this.game = game;
    this._offset = 0;
  }

  update() {
    this._offset = (this._offset + this.game.speed * BLOCK_SIZE) % CANVAS_HEIGHT;
    return this;
  }

  draw(ctx) {
    ctx.save();

    // Asphalt
    ctx.fillStyle = '#2a2a2a';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Road surface (slightly lighter between borders)
    ctx.fillStyle = '#333';
    ctx.fillRect(BORDER_PX, 0, CANVAS_WIDTH - BORDER_PX * 2, CANVAS_HEIGHT);

    // Scrolling lane dividers (white dashes)
    ctx.fillStyle = '#fff';
    const startDash = (this._offset % PERIOD) - PERIOD;
    for (let y = startDash; y < CANVAS_HEIGHT; y += PERIOD) {
      ctx.fillRect(DIVIDER_1_X, y, 4, DASH_H);
      ctx.fillRect(DIVIDER_2_X, y, 4, DASH_H);
    }

    // Tiled border sprites scrolling downward
    const startBorder = (this._offset % BORDER_PX) - BORDER_PX;
    for (let y = startBorder; y < CANVAS_HEIGHT; y += BORDER_PX) {
      drawShape(ctx, BLOCK_SIZE, border, 0, y);
      drawShape(ctx, BLOCK_SIZE, border, CANVAS_WIDTH - BORDER_PX, y);
    }

    ctx.restore();
    return this;
  }
}

export default Road;
