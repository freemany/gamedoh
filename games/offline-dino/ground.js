import { CANVAS_WIDTH } from './constants.js';

class Ground {
  constructor(game) {
    this.game = game;
    this._offset = 0; // pixel scroll offset
  }

  update() {
    this._offset -= this.game.speed * this.game.blockSize;
    if (this._offset <= -CANVAS_WIDTH) this._offset = 0;
    return this;
  }

  draw(ctx) {
    const y = (this.game.height - this.game.groundHeight) * this.game.blockSize;
    ctx.save();

    // Ground fill
    ctx.fillStyle = '#c8a26a';
    ctx.fillRect(0, y, CANVAS_WIDTH, this.game.groundHeight * this.game.blockSize);

    // Ground top line
    ctx.fillStyle = '#a07840';
    ctx.fillRect(0, y, CANVAS_WIDTH, 2);

    // Scrolling ground texture dots
    ctx.fillStyle = '#a07840';
    const dotW = 10, dotH = 2, spacing = 30;
    const off = ((this._offset % spacing) + spacing) % spacing;
    for (let x = off - spacing; x < CANVAS_WIDTH; x += spacing) {
      ctx.fillRect(x, y + 6, dotW, dotH);
      ctx.fillRect(x + 18, y + 12, 6, dotH);
    }

    ctx.restore();
    return this;
  }
}

export default Ground;
