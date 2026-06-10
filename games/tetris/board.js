import { COLS, ROWS, CELL, BOARD_X, BOARD_Y } from './constants.js';
import { drawCell } from './pieces.js';

class Board {
  constructor() {
    this.reset();
  }

  reset() {
    // grid[row][col] = color string | null
    this.grid = Array.from({ length: ROWS }, () => Array(COLS).fill(null));
  }

  // True if the given shape placed at (px, py) is inside bounds and not overlapping
  isValid(shape, px, py) {
    for (let dy = 0; dy < shape.length; dy++) {
      for (let dx = 0; dx < shape[dy].length; dx++) {
        if (!shape[dy][dx]) continue;
        const nx = px + dx;
        const ny = py + dy;
        if (nx < 0 || nx >= COLS) return false;
        if (ny >= ROWS)           return false;
        if (ny >= 0 && this.grid[ny][nx]) return false;
        // ny < 0 is allowed — piece partially above the board on spawn
      }
    }
    return true;
  }

  // Write piece cells into the grid permanently
  lock(shape, px, py, color) {
    shape.forEach((row, dy) =>
      row.forEach((cell, dx) => {
        if (cell) this.grid[py + dy][px + dx] = color;
      })
    );
  }

  // Remove complete rows, drop everything above. Returns number of lines cleared.
  clearLines() {
    let cleared = 0;
    for (let y = ROWS - 1; y >= 0; y--) {
      if (this.grid[y].every((cell) => cell !== null)) {
        this.grid.splice(y, 1);
        this.grid.unshift(Array(COLS).fill(null));
        cleared++;
        y++; // recheck the same index (row above just shifted down)
      }
    }
    return cleared;
  }

  draw(ctx) {
    ctx.save();

    // Board background
    ctx.fillStyle = '#0d0d1a';
    ctx.fillRect(BOARD_X, BOARD_Y, COLS * CELL, ROWS * CELL);

    // Locked cells
    this.grid.forEach((row, y) =>
      row.forEach((color, x) => {
        if (color) drawCell(ctx, BOARD_X + x * CELL, BOARD_Y + y * CELL, color);
      })
    );

    // Subtle grid lines
    ctx.strokeStyle = 'rgba(255,255,255,0.04)';
    ctx.lineWidth = 1;
    for (let x = 0; x <= COLS; x++) {
      ctx.beginPath();
      ctx.moveTo(BOARD_X + x * CELL, BOARD_Y);
      ctx.lineTo(BOARD_X + x * CELL, BOARD_Y + ROWS * CELL);
      ctx.stroke();
    }
    for (let y = 0; y <= ROWS; y++) {
      ctx.beginPath();
      ctx.moveTo(BOARD_X,             BOARD_Y + y * CELL);
      ctx.lineTo(BOARD_X + COLS * CELL, BOARD_Y + y * CELL);
      ctx.stroke();
    }

    // Board border
    ctx.strokeStyle = '#445';
    ctx.lineWidth = 2;
    ctx.strokeRect(BOARD_X, BOARD_Y, COLS * CELL, ROWS * CELL);

    ctx.restore();
  }
}

export default Board;
