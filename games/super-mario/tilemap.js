import { drawShape } from './gamedoh-engine.js';
import { BLOCK_SIZE, TILE_SIZE, CANVAS_WIDTH, CANVAS_HEIGHT } from './constants.js';

const TS = TILE_SIZE * BLOCK_SIZE; // tile width  = 64px
const TH = BLOCK_SIZE * 8;        // tile height = 32px (sprites are 8 rows tall)

// ── Tile sprites (16×8 blocks) ─────────────────────────────────────────────

const groundTile = [
  ['r','r','r','r','r','r','r','r','r','r','r','r','r','r','r','r'],
  ['r','o','o','o','o','r','o','o','o','o','r','o','o','o','o','r'],
  ['r','o','o','o','o','r','o','o','o','o','r','o','o','o','o','r'],
  ['r','r','r','r','r','r','r','r','r','r','r','r','r','r','r','r'],
  ['o','o','r','o','o','o','o','r','o','o','o','o','r','o','o','o'],
  ['o','o','r','o','o','o','o','r','o','o','o','o','r','o','o','o'],
  ['o','o','r','o','o','o','o','r','o','o','o','o','r','o','o','o'],
  ['r','r','r','r','r','r','r','r','r','r','r','r','r','r','r','r'],
];

const brickTile = [
  ['o','o','o','o','o','o','o','o','o','o','o','o','o','o','o','o'],
  ['o','r','r','r','r','o','r','r','r','r','o','r','r','r','r','o'],
  ['o','r','r','r','r','o','r','r','r','r','o','r','r','r','r','o'],
  ['o','o','o','o','o','o','o','o','o','o','o','o','o','o','o','o'],
  ['r','r','r','o','r','r','r','r','r','o','r','r','r','r','o','r'],
  ['r','r','r','o','r','r','r','r','r','o','r','r','r','r','o','r'],
  ['r','r','r','o','r','r','r','r','r','o','r','r','r','r','o','r'],
  ['o','o','o','o','o','o','o','o','o','o','o','o','o','o','o','o'],
];

// Question blocks drawn with canvas text — no pixel-art sprite needed

const pipeTopTile = [
  ['_','g','g','g','g','g','g','g','g','g','g','g','g','g','g','_'],
  ['g','g','l','l','l','g','g','g','g','g','g','l','l','l','g','g'],
  ['g','g','l','l','l','g','g','g','g','g','g','l','l','l','g','g'],
  ['g','g','g','g','g','g','g','g','g','g','g','g','g','g','g','g'],
  ['_','_','g','g','g','g','g','g','g','g','g','g','g','g','_','_'],
  ['_','_','g','g','l','l','g','g','g','g','l','l','g','g','_','_'],
  ['_','_','g','g','l','l','g','g','g','g','l','l','g','g','_','_'],
  ['_','_','g','g','g','g','g','g','g','g','g','g','g','g','_','_'],
];

const pipeBodyTile = [
  ['_','_','g','g','g','g','g','g','g','g','g','g','g','g','_','_'],
  ['_','_','g','g','l','l','g','g','g','g','l','l','g','g','_','_'],
  ['_','_','g','g','l','l','g','g','g','g','l','l','g','g','_','_'],
  ['_','_','g','g','g','g','g','g','g','g','g','g','g','g','_','_'],
  ['_','_','g','g','g','g','g','g','g','g','g','g','g','g','_','_'],
  ['_','_','g','g','l','l','g','g','g','g','l','l','g','g','_','_'],
  ['_','_','g','g','l','l','g','g','g','g','l','l','g','g','_','_'],
  ['_','_','g','g','g','g','g','g','g','g','g','g','g','g','_','_'],
];

// ── Level layouts ──────────────────────────────────────────────────────────
// World = 2560px = 40 tiles (TS=64px each). Pipes occupy 2 tiles width.
// Keep bricks/? at least 1 tile gap from any pipe edge.
// Goombas start at tile 6+ so Mario has reaction time.

export const LEVEL_1 = {
  ground:    [{ x: 0, w: 14 }, { x: 15, w: 13 }, { x: 29, w: 11 }],
  bricks:    [{ x: 8, y: 2 }, { x: 9, y: 2 }, { x: 23, y: 2 }, { x: 24, y: 2 }, { x: 36, y: 2 }],
  questions: [{ x: 10, y: 2 }, { x: 25, y: 2 }, { x: 38, y: 2 }],
  pipes:     [{ x: 3, h: 2 }, { x: 20, h: 2 }, { x: 33, h: 3 }],
  goombas:   [{ x: 6 }, { x: 12 }, { x: 17 }, { x: 22 }, { x: 30 }, { x: 37 }],
};

export const LEVEL_2 = {
  ground:    [{ x: 0, w: 10 }, { x: 12, w: 12 }, { x: 26, w: 14 }],
  bricks:    [{ x: 5, y: 2 }, { x: 6, y: 2 }, { x: 18, y: 2 }, { x: 19, y: 2 }, { x: 31, y: 2 }, { x: 32, y: 2 }],
  questions: [{ x: 7, y: 2 }, { x: 20, y: 2 }, { x: 34, y: 2 }],
  pipes:     [{ x: 2, h: 2 }, { x: 14, h: 3 }, { x: 27, h: 2 }, { x: 37, h: 2 }],
  goombas:   [{ x: 5 }, { x: 8 }, { x: 13 }, { x: 16 }, { x: 22 }, { x: 28 }, { x: 34 }, { x: 39 }],
};

// ── Solid collision rects ──────────────────────────────────────────────────

export const getTiles = (layout) => {
  const rects = [];
  const groundY = CANVAS_HEIGHT - TS; // 320px

  // Ground — full height to canvas bottom for each segment
  layout.ground.forEach(({ x, w }) => {
    rects.push({ x: x * TS, y: groundY, w: w * TS, h: TS });
  });

  // Brick platforms — TH tall
  layout.bricks.forEach(({ x, y }) => {
    const py = CANVAS_HEIGHT - (y + 1) * TS;
    rects.push({ x: x * TS, y: py, w: TS, h: TH });
  });

  // Question blocks — TH tall
  layout.questions.forEach(({ x, y }) => {
    const py = CANVAS_HEIGHT - (y + 1) * TS;
    rects.push({ x: x * TS, y: py, w: TS, h: TH });
  });

  // Pipes — extend 1px above actual top to close the strict-> boundary gap
  // (prevents Mario from passing through at the exact pipe-top pixel)
  layout.pipes.forEach(({ x, h }) => {
    const py = groundY - h * TH;
    rects.push({ x: x * TS, y: py - 1, w: 2 * TS, h: h * TH + 1 });
  });

  return rects;
};

// ── Draw ───────────────────────────────────────────────────────────────────

const drawTile = (ctx, sprite, px, py) => {
  drawShape(ctx, BLOCK_SIZE, sprite, px, py);
};

const drawQuestionBlock = (ctx, px, py, hits) => {
  const used = hits >= 3;
  ctx.save();
  // Outer brick-colour border (matches brick tile: 'r'=red, 'o'=orange)
  ctx.fillStyle = used ? '#666' : 'red';
  ctx.fillRect(px, py, TS, TH);
  // Inner orange inset (brick body colour)
  ctx.fillStyle = used ? '#888' : 'orange';
  ctx.fillRect(px + 3, py + 3, TS - 6, TH - 6);
  // Yellow centre
  ctx.fillStyle = used ? '#888' : '#e8b800';
  ctx.fillRect(px + 5, py + 5, TS - 10, TH - 10);
  // "?" text (only when not used)
  if (!used) {
    ctx.fillStyle = '#fff';
    ctx.font = `bold ${TH - 8}px monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('?', px + TS / 2, py + TH / 2);
  }
  ctx.restore();
};

export const drawTilemap = (ctx, cameraX, layout, blockHits = new Map()) => {
  const groundY = CANVAS_HEIGHT - TS;
  const buf = TS * 2;

  // Ground — 2 rows fill solid to canvas bottom
  layout.ground.forEach(({ x, w }) => {
    for (let tx = x; tx < x + w; tx++) {
      const px = tx * TS - cameraX;
      if (px > -buf && px < CANVAS_WIDTH + buf) {
        drawTile(ctx, groundTile, px, groundY);
        drawTile(ctx, groundTile, px, groundY + TH);
      }
    }
  });

  // Bricks
  layout.bricks.forEach(({ x, y }) => {
    const px = x * TS - cameraX;
    const py = CANVAS_HEIGHT - (y + 1) * TS;
    if (px > -buf && px < CANVAS_WIDTH + buf) {
      drawTile(ctx, brickTile, px, py);
    }
  });

  // Question blocks — drawn with canvas text
  layout.questions.forEach(({ x, y }, i) => {
    const px = x * TS - cameraX;
    const py = CANVAS_HEIGHT - (y + 1) * TS;
    if (px > -buf && px < CANVAS_WIDTH + buf) {
      drawQuestionBlock(ctx, px, py, blockHits.get(i) || 0);
    }
  });

  // Pipes — drawn at 2× horizontal scale to match 128px collision width
  layout.pipes.forEach(({ x, h }) => {
    const px = x * TS - cameraX;
    if (px <= -buf || px >= CANVAS_WIDTH + buf) return;
    ctx.save();
    ctx.translate(px, 0);
    ctx.scale(2, 1); // stretch sprite from 64px → 128px wide
    for (let ty = 0; ty < h - 1; ty++) {
      drawShape(ctx, BLOCK_SIZE, pipeBodyTile, 0, groundY - (ty + 1) * TH);
    }
    drawShape(ctx, BLOCK_SIZE, pipeTopTile, 0, groundY - h * TH);
    ctx.restore();
  });
};

// ── Cloud drawing ──────────────────────────────────────────────────────────

export const drawClouds = (ctx, cameraX) => {
  const clouds = [
    { x: 150, y: 60, r: 28 },  { x: 210, y: 48, r: 38 },  { x: 265, y: 64, r: 22 },
    { x: 500, y: 55, r: 32 },  { x: 560, y: 42, r: 42 },  { x: 620, y: 58, r: 26 },
    { x: 900, y: 62, r: 28 },  { x: 960, y: 50, r: 36 },  { x: 1020, y: 65, r: 22 },
    { x: 1300, y: 55, r: 34 }, { x: 1370, y: 44, r: 40 }, { x: 1430, y: 60, r: 24 },
    { x: 1700, y: 58, r: 30 }, { x: 1760, y: 46, r: 38 }, { x: 1820, y: 62, r: 26 },
    { x: 2100, y: 55, r: 32 }, { x: 2160, y: 44, r: 42 }, { x: 2220, y: 60, r: 24 },
    { x: 2450, y: 62, r: 28 }, { x: 2510, y: 50, r: 36 }, { x: 2560, y: 66, r: 22 },
  ];
  ctx.save();
  ctx.fillStyle = '#fff';
  clouds.forEach(({ x, y, r }) => {
    const px = x - cameraX * 0.5;
    if (px < -100 || px > CANVAS_WIDTH + 100) return;
    ctx.beginPath();
    ctx.arc(px, y, r, 0, Math.PI * 2);
    ctx.arc(px + r * 0.8, y - r * 0.3, r * 0.7, 0, Math.PI * 2);
    ctx.arc(px + r * 1.6, y, r * 0.6, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.restore();
};
