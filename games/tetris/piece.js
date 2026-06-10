import { PIECES, drawCell } from './pieces.js';
import { CELL, BOARD_X, BOARD_Y } from './constants.js';

class Piece {
  constructor(type) {
    const def = PIECES[type];
    this.type      = type;
    this.color     = def.color;
    this.rotations = def.rotations;
    this.rotation  = 0;
    this.x         = 3;  // start centred on the 10-wide board
    this.y         = 0;
  }

  get shape() { return this.rotations[this.rotation]; }

  rotate() {
    this.rotation = (this.rotation + 1) % this.rotations.length;
  }

  // Draw piece at its board position
  draw(ctx) {
    ctx.save();
    this.shape.forEach((row, dy) =>
      row.forEach((cell, dx) => {
        if (!cell) return;
        const py = this.y + dy;
        if (py < 0) return; // don't draw cells above the board
        drawCell(
          ctx,
          BOARD_X + (this.x + dx) * CELL,
          BOARD_Y + py * CELL,
          this.color
        );
      })
    );
    ctx.restore();
  }

  // Draw ghost (landing preview) at a different Y, semi-transparent
  drawGhost(ctx, ghostY) {
    ctx.save();
    ctx.globalAlpha = 0.2;
    this.shape.forEach((row, dy) =>
      row.forEach((cell, dx) => {
        if (!cell) return;
        const py = ghostY + dy;
        if (py < 0) return;
        drawCell(
          ctx,
          BOARD_X + (this.x + dx) * CELL,
          BOARD_Y + py * CELL,
          this.color
        );
      })
    );
    ctx.restore();
  }

  // Draw a small preview (sidebar "NEXT" box) using a fixed cell size
  drawPreview(ctx, originX, originY) {
    const previewCell = 20;
    ctx.save();
    this.shape.forEach((row, dy) =>
      row.forEach((cell, dx) => {
        if (cell) drawCell(ctx, originX + dx * previewCell, originY + dy * previewCell, this.color, previewCell);
      })
    );
    ctx.restore();
  }
}

export default Piece;
