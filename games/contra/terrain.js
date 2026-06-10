import { CANVAS_WIDTH, CANVAS_HEIGHT, GROUND_Y, WORLD_WIDTH, WORLD_HEIGHT, PLAT_H } from './constants.js';

export const drawBackground = (ctx, cameraX, cameraY, isVertical) => {
  ctx.save();
  if (isVertical) {
    // Dark stone cliff — vertical stage
    ctx.fillStyle = '#0d0d1a';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    // Repeating horizontal rock ledges scrolling with cameraY
    const offset = Math.floor(cameraY * 0.4) % 60;
    ctx.fillStyle = '#1a1a2e';
    for (let ty = -offset; ty < CANVAS_HEIGHT + 60; ty += 60) {
      ctx.fillRect(0, ty, CANVAS_WIDTH, 10);
    }
    // Left and right cliff walls
    ctx.fillStyle = '#2a1a0a';
    ctx.fillRect(0, 0, 8, CANVAS_HEIGHT);
    ctx.fillRect(CANVAS_WIDTH - 8, 0, 8, CANVAS_HEIGHT);
  } else {
    // Dark jungle sky — horizontal stage
    ctx.fillStyle = '#0d1b0d';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    const offset = Math.floor(cameraX * 0.4) % 80;
    for (let tx = -offset; tx < CANVAS_WIDTH + 80; tx += 80) {
      ctx.fillStyle = '#3e2a10';
      ctx.fillRect(tx, 0, 14, CANVAS_HEIGHT);
      ctx.fillStyle = '#1b3a1b';
      ctx.fillRect(tx - 10, 0, 34, 50);
    }
  }
  ctx.restore();
};

export const drawTerrain = (ctx, levelData, cameraX, cameraY) => {
  ctx.save();

  if (levelData.type === 'vertical') {
    // Bottom ground
    ctx.fillStyle = '#8b6914';
    ctx.fillRect(0, WORLD_HEIGHT - cameraY, CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx.fillStyle = '#4caf50';
    ctx.fillRect(0, WORLD_HEIGHT - cameraY, CANVAS_WIDTH, 4);

    // Left / right walls
    ctx.fillStyle = '#4a3010';
    ctx.fillRect(0, 0, 8, CANVAS_HEIGHT);
    ctx.fillRect(CANVAS_WIDTH - 8, 0, 8, CANVAS_HEIGHT);

    // Platforms
    for (const p of levelData.platforms) {
      const sy = p.y - cameraY;
      ctx.fillStyle = '#8b6914';
      ctx.fillRect(p.x, sy, p.w, PLAT_H);
      ctx.fillStyle = '#c8962e';
      for (let bx = p.x; bx < p.x + p.w; bx += 30) {
        ctx.fillRect(bx, sy + 4, 18, 8);
      }
      ctx.fillStyle = '#2e7d32';
      ctx.fillRect(p.x, sy, p.w, 6);
      ctx.fillStyle = '#4caf50';
      ctx.fillRect(p.x, sy, p.w, 3);
    }

    // End flag at top
    const flagX = CANVAS_WIDTH / 2 - 15;
    const flagY = levelData.endY - cameraY;
    ctx.fillStyle = '#ffeb3b';
    ctx.fillRect(flagX, flagY, 5, 80);
    ctx.fillStyle = '#ff6f00';
    ctx.fillRect(flagX + 5, flagY, 24, 16);

  } else {
    // Horizontal level
    const cliffH = CANVAS_HEIGHT - GROUND_Y;
    ctx.fillStyle = '#8b6914';
    ctx.fillRect(-cameraX, GROUND_Y, WORLD_WIDTH, cliffH);
    ctx.fillStyle = '#c8962e';
    for (let bx = 0; bx < WORLD_WIDTH; bx += 40) {
      ctx.fillRect(bx - cameraX, GROUND_Y + 8, 28, 14);
    }
    ctx.fillStyle = '#2e7d32';
    ctx.fillRect(-cameraX, GROUND_Y, WORLD_WIDTH, 7);
    ctx.fillStyle = '#4caf50';
    ctx.fillRect(-cameraX, GROUND_Y, WORLD_WIDTH, 3);

    for (const p of levelData.platforms) {
      ctx.fillStyle = '#8b6914';
      ctx.fillRect(p.x - cameraX, p.y, p.w, PLAT_H);
      ctx.fillStyle = '#c8962e';
      for (let bx = p.x; bx < p.x + p.w; bx += 30) {
        ctx.fillRect(bx - cameraX, p.y + 4, 18, 8);
      }
      ctx.fillStyle = '#2e7d32';
      ctx.fillRect(p.x - cameraX, p.y, p.w, 6);
      ctx.fillStyle = '#4caf50';
      ctx.fillRect(p.x - cameraX, p.y, p.w, 3);
    }

    ctx.fillStyle = '#ffeb3b';
    ctx.fillRect(levelData.endX - cameraX, GROUND_Y - 90, 5, 90);
    ctx.fillStyle = '#ff6f00';
    ctx.fillRect(levelData.endX - cameraX + 5, GROUND_Y - 90, 24, 16);
  }

  ctx.restore();
};

export const getTerrain = (levelData) => {
  if (levelData.type === 'vertical') {
    const rects = [
      // bottom ground
      { x: 0, y: WORLD_HEIGHT, w: CANVAS_WIDTH, h: 40 },
      // left wall
      { x: -40, y: 0, w: 40, h: WORLD_HEIGHT + 40 },
      // right wall
      { x: CANVAS_WIDTH, y: 0, w: 40, h: WORLD_HEIGHT + 40 },
    ];
    for (const p of levelData.platforms) {
      rects.push({ x: p.x, y: p.y, w: p.w, h: PLAT_H });
    }
    return rects;
  }

  // Horizontal
  const rects = [{ x: 0, y: GROUND_Y, w: WORLD_WIDTH, h: CANVAS_HEIGHT - GROUND_Y }];
  for (const p of levelData.platforms) {
    rects.push({ x: p.x, y: p.y, w: p.w, h: PLAT_H });
  }
  return rects;
};
