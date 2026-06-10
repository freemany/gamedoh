import { CANVAS_WIDTH, CANVAS_HEIGHT } from './constants.js';
import { SPLASH } from './splashImage.js';

const SPLASH_COLORS = {
  r: '#f44336', o: '#ff9800', y: '#ffeb3b', g: '#4caf50',
  b: '#1565c0', p: '#f4c2a1', d: '#212121', w: '#ffffff',
  k: '#111111', s: '#aaaaaa', u: '#c8a06e', _: null,
};

const drawSplash = (ctx, x, y, blockSize) => {
  SPLASH.forEach((row, ry) => {
    row.forEach((cell, cx) => {
      const color = SPLASH_COLORS[cell];
      if (!color) return;
      ctx.fillStyle = color;
      ctx.fillRect(x + cx * blockSize, y + ry * blockSize, blockSize, blockSize);
    });
  });
};

// Splash is 64×37 pixels; at blockSize=3 → 192×111 px
const SPLASH_BLOCK = 3;
const SPLASH_H = 37 * SPLASH_BLOCK; // 111
const TEXT_CX  = 170;                               // left-panel text centre x
const SPLASH_X = 320; // pulled left, sits beside the text panel
const SPLASH_Y = Math.round((CANVAS_HEIGHT - SPLASH_H) / 2); // vertically centred → ~104

export const drawStartScreen = (ctx, startButton) => {
  ctx.save();
  ctx.fillStyle = 'rgba(0,0,0,0.92)';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // Splash image — right side
  drawSplash(ctx, SPLASH_X, SPLASH_Y, SPLASH_BLOCK);

  // Title
  ctx.fillStyle = '#ff1744';
  ctx.font = 'bold 44px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText('CONTRA', TEXT_CX, 52);

  // Divider
  ctx.strokeStyle = '#ff1744';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(TEXT_CX - 100, 62);
  ctx.lineTo(TEXT_CX + 100, 62);
  ctx.stroke();

  // Controls header
  ctx.fillStyle = '#ffeb3b';
  ctx.font = 'bold 13px monospace';
  ctx.fillText('— HOW TO PLAY —', TEXT_CX, 82);

  // Control rows
  const rows = [
    ['←  →', 'Move left / right'],
    ['Space', 'Jump'],
    ['↑ + Z', 'Shoot up'],
    ['↓', 'Squat'],
    ['Z', 'Shoot'],
    ['P', 'Pause / resume'],
  ];

  ctx.font = '12px monospace';
  let ry = 100;
  for (const [key, desc] of rows) {
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'right';
    ctx.fillText(key, TEXT_CX - 8, ry);
    ctx.fillStyle = '#aaa';
    ctx.textAlign = 'left';
    ctx.fillText(desc, TEXT_CX + 8, ry);
    ry += 20;
  }

  // Objective
  ctx.textAlign = 'center';
  ctx.fillStyle = '#4caf50';
  ctx.font = 'bold 11px monospace';
  ctx.fillText('Reach the flag to advance.', TEXT_CX, ry + 10);
  ctx.fillStyle = '#888';
  ctx.font = '11px monospace';
  ctx.fillText('1 hit = death  •  3 lives  •  2 levels', TEXT_CX, ry + 26);

  // Start button
  startButton.y = CANVAS_HEIGHT - 25;
  startButton.x = TEXT_CX + 65;
  startButton.draw(ctx);
  ctx.restore();
};

export const drawPauseOverlay = (ctx) => {
  ctx.save();
  ctx.fillStyle = 'rgba(0,0,0,0.6)';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 36px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('PAUSED', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 20);
  ctx.font = '14px monospace';
  ctx.fillStyle = '#aaa';
  ctx.fillText('[P] to resume', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 20);
  ctx.restore();
};

export const drawGameOverScreen = (ctx, score, restartButton) => {
  ctx.save();
  ctx.fillStyle = 'rgba(0,0,0,0.88)';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  ctx.fillStyle = '#ff1744';
  ctx.font = 'bold 44px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('GAME OVER', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 50);
  ctx.fillStyle = '#fff';
  ctx.font = '18px monospace';
  ctx.fillText(`Score: ${score}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 5);
  restartButton.draw(ctx);
  ctx.restore();
};

export const drawWinScreen = (ctx, score, restartButton) => {
  ctx.save();
  ctx.fillStyle = 'rgba(0,0,0,0.88)';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  ctx.fillStyle = '#ffeb3b';
  ctx.font = 'bold 36px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('MISSION COMPLETE!', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 50);
  ctx.fillStyle = '#fff';
  ctx.font = '18px monospace';
  ctx.fillText(`Score: ${score}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 5);
  restartButton.draw(ctx);
  ctx.restore();
};
