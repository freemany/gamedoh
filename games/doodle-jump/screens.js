import { CANVAS_WIDTH, CANVAS_HEIGHT } from './constants.js';

const skyGradient = (ctx) => {
  const grad = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
  grad.addColorStop(0, '#b3e5fc');
  grad.addColorStop(1, '#e0f7fa');
  return grad;
};

export const drawStartScreen = (ctx, startButton) => {
  ctx.save();
  ctx.fillStyle = skyGradient(ctx);
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // Title
  ctx.textAlign    = 'center';
  ctx.textBaseline = 'middle';
  ctx.strokeStyle  = 'rgba(255,255,255,0.8)';
  ctx.lineWidth    = 6;
  ctx.font         = 'bold 58px monospace';
  ctx.fillStyle    = '#1565c0';
  ctx.strokeText('DOODLE', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 130);
  ctx.fillText('DOODLE',   CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 130);
  ctx.strokeText('JUMP',   CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 70);
  ctx.fillText('JUMP',     CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 70);

  // Controls
  ctx.font      = '15px monospace';
  ctx.fillStyle = '#37474f';
  ctx.lineWidth = 0;
  const lines = [
    '← → Arrow keys to move',
    'Auto-bounce on platforms!',
    "Don't fall off the screen!",
  ];
  lines.forEach((line, i) =>
    ctx.fillText(line, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 4 + i * 26),
  );

  ctx.restore();

  startButton.y = CANVAS_HEIGHT - 100;
  startButton.draw(ctx);
};

export const drawPauseOverlay = (ctx) => {
  ctx.save();
  ctx.fillStyle = 'rgba(0,0,0,0.6)';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  ctx.textAlign    = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle    = '#00e5ff';
  ctx.font         = 'bold 48px monospace';
  ctx.fillText('PAUSED', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 20);
  ctx.fillStyle = '#aaa';
  ctx.font      = '18px monospace';
  ctx.fillText('[P] to resume', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 36);
  ctx.restore();
};

export const drawGameOverScreen = (ctx, score, restartButton) => {
  ctx.save();
  ctx.fillStyle = 'rgba(0,0,0,0.82)';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  ctx.textAlign    = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle    = '#ff1744';
  ctx.font         = 'bold 48px monospace';
  ctx.fillText('GAME OVER', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 60);
  ctx.fillStyle = '#fff';
  ctx.font      = '22px monospace';
  ctx.fillText(`Height: ${score}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
  ctx.restore();
  restartButton.draw(ctx);
};

export const drawWinScreen = (ctx, score, restartButton) => {
  ctx.save();
  ctx.fillStyle = 'rgba(0,40,0,0.85)';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  ctx.textAlign    = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle    = '#00e676';
  ctx.font         = 'bold 48px monospace';
  ctx.fillText('YOU WIN!', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 60);
  ctx.fillStyle = '#fff';
  ctx.font      = '22px monospace';
  ctx.fillText(`Height: ${score}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
  ctx.restore();
  restartButton.draw(ctx);
};
