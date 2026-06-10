import { CANVAS_WIDTH, CANVAS_HEIGHT } from './constants.js';

export const drawStartScreen = (ctx, startButton) => {
  ctx.save();

  // Background
  ctx.fillStyle = '#1a1a2e';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // Decorative falling blocks
  const blocks = [
    { x: 30,  y: 80,  c: '#00e5ff' }, { x: 60,  y: 140, c: '#cc44ff' },
    { x: 340, y: 100, c: '#ff9100' }, { x: 370, y: 60,  c: '#ff1744' },
    { x: 160, y: 520, c: '#00e676' }, { x: 230, y: 540, c: '#2979ff' },
  ];
  blocks.forEach(({ x, y, c }) => {
    ctx.fillStyle = c;
    ctx.fillRect(x, y, 24, 24);
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.fillRect(x, y, 24, 4);
    ctx.fillRect(x, y, 4, 24);
  });

  // Title
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#00e5ff';
  ctx.strokeStyle = '#003344';
  ctx.lineWidth = 6;
  ctx.font = 'bold 72px monospace';
  ctx.strokeText('TETRIS', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 110);
  ctx.fillText('TETRIS', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 110);

  // Controls
  ctx.font = '15px monospace';
  ctx.fillStyle = '#aaa';
  const lines = [
    '← → Move    ↑ Rotate',
    '↓ Soft drop   Space Hard drop',
  ];
  lines.forEach((line, i) => ctx.fillText(line, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 30 + i * 26));

  // Scoring guide
  ctx.font = '13px monospace';
  ctx.fillStyle = '#666';
  ctx.fillText('1 line = 100pts  2 = 300  3 = 500  4 = 800', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 36);

  ctx.restore();

  startButton.y = CANVAS_HEIGHT - 100;
  startButton.draw(ctx);
};

export const drawPauseOverlay = (ctx) => {
  ctx.save();
  ctx.fillStyle = 'rgba(0,0,0,0.7)';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#00e5ff';
  ctx.font = 'bold 52px monospace';
  ctx.fillText('PAUSED', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 20);
  ctx.fillStyle = '#aaa';
  ctx.font = '18px monospace';
  ctx.fillText('[P] to resume', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 36);
  ctx.restore();
};

export const drawGameOverScreen = (ctx, score, restartButton) => {
  ctx.save();
  ctx.fillStyle = 'rgba(0,0,0,0.85)';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#ff1744';
  ctx.font = 'bold 52px monospace';
  ctx.fillText('GAME OVER', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 60);
  ctx.fillStyle = '#fff';
  ctx.font = '22px monospace';
  ctx.fillText(`Score: ${score}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
  ctx.restore();
  restartButton.draw(ctx);
};

export const drawWinScreen = (ctx, score, restartButton) => {
  ctx.save();
  ctx.fillStyle = 'rgba(0,40,0,0.85)';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#00e676';
  ctx.font = 'bold 52px monospace';
  ctx.fillText('YOU WIN!', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 60);
  ctx.fillStyle = '#fff';
  ctx.font = '22px monospace';
  ctx.fillText(`Score: ${score}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
  ctx.restore();
  restartButton.draw(ctx);
};
