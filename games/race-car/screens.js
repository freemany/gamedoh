import { Timer } from './gamedoh-engine.js';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from './constants.js';

export const drawStartScreen = (ctx, startButton) => {
  ctx.save();

  // Dark road background
  ctx.fillStyle = '#1a1a2e';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // Road stripes hint
  ctx.fillStyle = '#333';
  ctx.fillRect(60, 0, CANVAS_WIDTH - 120, CANVAS_HEIGHT);
  ctx.fillStyle = '#555';
  for (let y = 0; y < CANVAS_HEIGHT; y += 60) {
    ctx.fillRect(CANVAS_WIDTH / 2 - 2, y, 4, 30);
  }

  // Title
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#f5a623';
  ctx.font = `bold 52px monospace`;
  ctx.fillText('RACE CAR', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 100);

  // Instructions
  ctx.fillStyle = '#ccc';
  ctx.font = `18px monospace`;
  ctx.fillText('← → Arrow keys to change lanes', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 30);
  ctx.fillText('Avoid opponent cars', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
  ctx.fillText('[P] to pause', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 30);

  ctx.restore();
  startButton.draw(ctx);
};

export const drawPauseOverlay = (ctx) => {
  ctx.save();
  ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  ctx.fillStyle = '#fff';
  ctx.font = `bold 48px monospace`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('PAUSED', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 20);
  ctx.fillStyle = '#aaa';
  ctx.font = `20px monospace`;
  ctx.fillText('[P] to resume', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 30);
  ctx.restore();
};

export const drawLevelTransition = async (game, levelNumber) => {
  game.transitioning = true;
  let remaining = 3;

  game.transitionRenderer = () => {
    const { ctx } = game;
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#f5a623';
    ctx.font = `bold 52px monospace`;
    ctx.fillText(`Level ${levelNumber}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 50);
    ctx.fillStyle = '#fff';
    ctx.font = `bold 80px monospace`;
    ctx.fillText(remaining, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 40);
    ctx.restore();
  };

  const timer = new Timer(3);
  await timer.start((r) => {
    remaining = r;
  });

  game.transitioning = false;
  game.transitionRenderer = null;
};

export const drawGameOverScreen = (ctx, score, restartButton) => {
  ctx.save();
  ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#e33';
  ctx.font = `bold 52px monospace`;
  ctx.fillText('GAME OVER', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 60);
  ctx.fillStyle = '#fff';
  ctx.font = `24px monospace`;
  ctx.fillText(`Score: ${score}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
  ctx.restore();
  restartButton.draw(ctx);
};

export const drawWinScreen = (ctx, score, restartButton) => {
  ctx.save();
  ctx.fillStyle = 'rgba(0, 80, 0, 0.8)';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#f5a623';
  ctx.font = `bold 52px monospace`;
  ctx.fillText('YOU WIN!', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 60);
  ctx.fillStyle = '#fff';
  ctx.font = `24px monospace`;
  ctx.fillText(`Score: ${score}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
  ctx.restore();
  restartButton.draw(ctx);
};
