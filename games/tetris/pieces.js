import { CELL } from './constants.js';

// ── Colour map for the 7 tetrominoes ──────────────────────────────────────
const CELL_COLORS = {
  l: '#00e5ff', // cyan   — I
  y: '#ffea00', // yellow — O
  p: '#cc44ff', // purple — T
  g: '#00e676', // green  — S
  r: '#ff1744', // red    — Z
  b: '#2979ff', // blue   — J
  o: '#ff9100', // orange — L
};

// Draw a single tetromino cell with a highlight/shadow bevel
export const drawCell = (ctx, px, py, color, size = CELL) => {
  const c = CELL_COLORS[color];
  if (!c) return;
  ctx.fillStyle = c;
  ctx.fillRect(px + 1, py + 1, size - 2, size - 2);
  // top-left highlight
  ctx.fillStyle = 'rgba(255,255,255,0.35)';
  ctx.fillRect(px + 1, py + 1, size - 2, 3);
  ctx.fillRect(px + 1, py + 1, 3, size - 2);
  // bottom-right shadow
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.fillRect(px + 1, py + size - 4, size - 2, 3);
  ctx.fillRect(px + size - 4, py + 1, 3, size - 2);
};

// ── Tetromino rotation matrices (4×4, SRS-inspired) ───────────────────────
export const PIECES = {
  I: {
    color: 'l',
    rotations: [
      [[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]],
      [[0,0,1,0],[0,0,1,0],[0,0,1,0],[0,0,1,0]],
      [[0,0,0,0],[0,0,0,0],[1,1,1,1],[0,0,0,0]],
      [[0,1,0,0],[0,1,0,0],[0,1,0,0],[0,1,0,0]],
    ],
  },
  O: {
    color: 'y',
    rotations: [
      [[0,1,1,0],[0,1,1,0],[0,0,0,0],[0,0,0,0]],
    ],
  },
  T: {
    color: 'p',
    rotations: [
      [[0,1,0,0],[1,1,1,0],[0,0,0,0],[0,0,0,0]],
      [[0,1,0,0],[0,1,1,0],[0,1,0,0],[0,0,0,0]],
      [[0,0,0,0],[1,1,1,0],[0,1,0,0],[0,0,0,0]],
      [[0,1,0,0],[1,1,0,0],[0,1,0,0],[0,0,0,0]],
    ],
  },
  S: {
    color: 'g',
    rotations: [
      [[0,1,1,0],[1,1,0,0],[0,0,0,0],[0,0,0,0]],
      [[0,1,0,0],[0,1,1,0],[0,0,1,0],[0,0,0,0]],
    ],
  },
  Z: {
    color: 'r',
    rotations: [
      [[1,1,0,0],[0,1,1,0],[0,0,0,0],[0,0,0,0]],
      [[0,0,1,0],[0,1,1,0],[0,1,0,0],[0,0,0,0]],
    ],
  },
  J: {
    color: 'b',
    rotations: [
      [[1,0,0,0],[1,1,1,0],[0,0,0,0],[0,0,0,0]],
      [[0,1,1,0],[0,1,0,0],[0,1,0,0],[0,0,0,0]],
      [[0,0,0,0],[1,1,1,0],[0,0,1,0],[0,0,0,0]],
      [[0,1,0,0],[0,1,0,0],[1,1,0,0],[0,0,0,0]],
    ],
  },
  L: {
    color: 'o',
    rotations: [
      [[0,0,1,0],[1,1,1,0],[0,0,0,0],[0,0,0,0]],
      [[0,1,0,0],[0,1,0,0],[0,1,1,0],[0,0,0,0]],
      [[0,0,0,0],[1,1,1,0],[1,0,0,0],[0,0,0,0]],
      [[1,1,0,0],[0,1,0,0],[0,1,0,0],[0,0,0,0]],
    ],
  },
};

export const PIECE_TYPES = Object.keys(PIECES);
