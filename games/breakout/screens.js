import { CANVAS_WIDTH, CANVAS_HEIGHT } from './constants.js';

export const drawStartScreen = (ctx, startButton) => {
  ctx.save();
  ctx.fillStyle = '#0d1b2a';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // Title
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#4fc3f7';
  ctx.font = 'bold 64px monospace';
  ctx.fillText('BREAKOUT', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 120);

  // Controls
  const lines = [
    '← → Arrow Keys — Move paddle',
    'P — Pause',
    '',
    '3 levels · 3 lives',
    'Clear all bricks to advance',
  ];
  ctx.font = '16px monospace';
  ctx.fillStyle = '#90caf9';
  lines.forEach((line, i) => {
    ctx.fillText(line, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 40 + i * 28);
  });

  ctx.restore();

  // Push button to bottom of screen, clear of text
  startButton.x = CANVAS_WIDTH / 2 + 60;
  startButton.y = CANVAS_HEIGHT - 40;
  startButton.draw(ctx);
};

export const drawPauseOverlay = (ctx) => {
  ctx.save();
  ctx.fillStyle = 'rgba(0,0,0,0.6)';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = 'white';
  ctx.font = 'bold 48px monospace';
  ctx.fillText('PAUSED', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
  ctx.font = '18px monospace';
  ctx.fillStyle = '#90caf9';
  ctx.fillText('Press P to resume', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 50);
  ctx.restore();
};

export const drawGameOverScreen = (ctx, score, restartButton) => {
  ctx.save();
  ctx.fillStyle = 'rgba(0,0,0,0.8)';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#e53935';
  ctx.font = 'bold 56px monospace';
  ctx.fillText('GAME OVER', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 70);
  ctx.fillStyle = 'white';
  ctx.font = '24px monospace';
  ctx.fillText(`Score: ${score}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
  ctx.restore();
  restartButton.draw(ctx);
};

export const drawWinScreen = (ctx, score, restartButton) => {
  ctx.save();
  ctx.fillStyle = 'rgba(0,30,10,0.85)';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#fdd835';
  ctx.font = 'bold 56px monospace';
  ctx.fillText('YOU WIN!', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 70);
  ctx.fillStyle = 'white';
  ctx.font = '24px monospace';
  ctx.fillText(`Score: ${score}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
  ctx.restore();
  restartButton.draw(ctx);
};
