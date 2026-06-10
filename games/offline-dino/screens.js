import { Timer } from './gamedoh-engine.js';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from './constants.js';

const INSTRUCTIONS = ['↑  /  SPACE  —  Jump', '↓  —  Duck  (hold)', 'P  /  Esc  —  Pause'];

export const drawStartScreen = (ctx, startButton) => {
  const cx = CANVAS_WIDTH / 2,
    cy = CANVAS_HEIGHT / 2;
  ctx.save();
  ctx.fillStyle = '#87ceeb';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  ctx.fillStyle = '#555';
  ctx.font = 'bold 56px monospace';
  ctx.fillText('DINO RUN', cx, cy - 70);

  ctx.font = '16px monospace';
  ctx.fillStyle = '#888';
  INSTRUCTIONS.forEach((line, i) => {
    ctx.fillText(line, cx, cy - 20 + i * 26);
  });
  ctx.restore();

  startButton.draw(ctx);
};

export const drawPauseOverlay = (ctx) => {
  const cx = CANVAS_WIDTH / 2,
    cy = CANVAS_HEIGHT / 2;
  ctx.save();
  ctx.fillStyle = 'rgba(255,255,255,0.65)';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#333';
  ctx.font = 'bold 44px monospace';
  ctx.fillText('PAUSED', cx, cy - 15);
  ctx.font = '18px monospace';
  ctx.fillStyle = '#888';
  ctx.fillText('Press P or Escape to resume', cx, cy + 25);
  ctx.restore();
};

const _drawLevelFrame = (ctx, levelNumber, remaining, width, height, blockSize) => {
  const cx = (width / 2) * blockSize;
  const cy = (height / 2) * blockSize;
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#333';
  ctx.font = 'bold 60px monospace';
  ctx.fillText(`Level ${levelNumber}`, cx, cy - 40);
  ctx.font = 'bold 80px monospace';
  ctx.fillStyle = '#555';
  ctx.fillText(remaining, cx, cy + 40);
  ctx.restore();
};

export const drawLevelTransition = async (game, levelNumber) => {
  game.transitioning = true;
  await new Timer(3).start((remaining) => {
    game.transitionRenderer = () => {
      const { ctx, blockSize, width, height } = game;
      _drawLevelFrame(ctx, levelNumber, remaining, width, height, blockSize);
    };
  });
  game.transitionRenderer = null;
  game.transitioning = false;
};

export const drawWinScreen = (ctx, score, restartButton) => {
  const cx = CANVAS_WIDTH / 2,
    cy = CANVAS_HEIGHT / 2;
  ctx.save();
  ctx.fillStyle = 'rgba(0,0,0,0.45)';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#4c4';
  ctx.font = 'bold 52px monospace';
  ctx.fillText('YOU WIN!', cx, cy - 40);
  ctx.font = '26px monospace';
  ctx.fillStyle = '#fff';
  ctx.fillText(`Score: ${score}`, cx, cy + 5);
  ctx.restore();
  restartButton.draw(ctx);
};

export const drawGameOverScreen = (ctx, score, restartButton) => {
  const cx = CANVAS_WIDTH / 2,
    cy = CANVAS_HEIGHT / 2;
  ctx.save();
  ctx.fillStyle = 'rgba(0,0,0,0.45)';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 52px monospace';
  ctx.fillText('GAME OVER', cx, cy - 40);
  ctx.font = '26px monospace';
  ctx.fillText(`Score: ${score}`, cx, cy + 5);
  ctx.restore();

  restartButton.draw(ctx);
};
