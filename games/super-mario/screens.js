import { Timer } from './gamedoh-engine.js';
import { CANVAS_WIDTH, CANVAS_HEIGHT, STOMP_SCORE, MUSHROOM_SCORE, COIN_SCORE } from './constants.js';

export const drawStartScreen = (ctx, startButton) => {
  ctx.save();

  // Sky
  ctx.fillStyle = '#5c94fc';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // Clouds
  ctx.fillStyle = '#fff';
  [[120, 70, 30], [165, 58, 38], [210, 72, 25],
   [440, 65, 28], [485, 52, 36], [528, 67, 22]].forEach(([x, y, r]) => {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.arc(x + r * 0.9, y - r * 0.3, r * 0.7, 0, Math.PI * 2);
    ctx.arc(x + r * 1.7, y, r * 0.6, 0, Math.PI * 2);
    ctx.fill();
  });

  // Ground strip
  ctx.fillStyle = '#c84c0c';
  ctx.fillRect(0, CANVAS_HEIGHT - 64, CANVAS_WIDTH, 64);
  ctx.fillStyle = '#e86030';
  ctx.fillRect(0, CANVAS_HEIGHT - 64, CANVAS_WIDTH, 8);

  // Title
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#fff';
  ctx.strokeStyle = '#c84c0c';
  ctx.lineWidth = 6;
  ctx.font = 'bold 56px monospace';
  ctx.strokeText('SUPER MARIO', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 80);
  ctx.fillText('SUPER MARIO', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 80);

  ctx.fillStyle = '#f8d800';
  ctx.font = 'bold 20px monospace';
  ctx.fillText('← → to move   ↑ to jump', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 28);

  // Scoring guide
  ctx.font = '15px monospace';
  ctx.fillStyle = '#fff';
  const col1 = CANVAS_WIDTH / 2 - 140;
  const col2 = CANVAS_WIDTH / 2 + 20;
  let row = CANVAS_HEIGHT / 2 + 10;
  const lineH = 22;
  ctx.textAlign = 'left';
  ctx.fillText(`👾 Stomp Goomba`, col1, row);
  ctx.fillStyle = '#f8d800';
  ctx.fillText(`+${STOMP_SCORE} pts`, col2, row);
  row += lineH;
  ctx.fillStyle = '#fff';
  ctx.fillText(`🍄 Eat Mushroom`, col1, row);
  ctx.fillStyle = '#f8d800';
  ctx.fillText(`+${MUSHROOM_SCORE} pts`, col2, row);
  row += lineH;
  ctx.fillStyle = '#fff';
  ctx.fillText(`❓ Hit ? Block x3`, col1, row);
  ctx.fillStyle = '#f8d800';
  ctx.fillText(`+${COIN_SCORE} pts`, col2, row);

  ctx.textAlign = 'center';
  ctx.fillStyle = '#ccc';
  ctx.font = '14px monospace';
  ctx.fillText('[P] to pause', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 88);

  ctx.restore();
  // Push start button below the scoring guide, just above the ground strip
  startButton.y = CANVAS_HEIGHT - 72;
  startButton.draw(ctx);
};

export const drawPauseOverlay = (ctx) => {
  ctx.save();
  ctx.fillStyle = 'rgba(0,0,0,0.6)';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  ctx.fillStyle = '#f8d800';
  ctx.font = 'bold 52px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('PAUSED', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 20);
  ctx.fillStyle = '#ccc';
  ctx.font = '20px monospace';
  ctx.fillText('[P] to resume', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 36);
  ctx.restore();
};

export const drawLevelTransition = async (game, levelNumber) => {
  game.transitioning = true;
  let remaining = 3;

  game.transitionRenderer = () => {
    const { ctx } = game;
    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#f8d800';
    ctx.font = 'bold 52px monospace';
    ctx.fillText(`WORLD 1-${levelNumber}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 50);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 80px monospace';
    ctx.fillText(remaining, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 40);
    ctx.restore();
  };

  const timer = new Timer(3);
  await timer.start((r) => { remaining = r; });

  game.transitioning = false;
  game.transitionRenderer = null;
};

export const drawGameOverScreen = (ctx, score, restartButton, timeUp = false) => {
  ctx.save();
  ctx.fillStyle = 'rgba(0,0,0,0.8)';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  if (timeUp) {
    ctx.fillStyle = '#f8d800';
    ctx.font = 'bold 38px monospace';
    ctx.fillText('TIME UP!', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 110);
  }

  ctx.fillStyle = '#e33';
  ctx.font = 'bold 56px monospace';
  ctx.fillText('GAME OVER', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 60);
  ctx.fillStyle = '#fff';
  ctx.font = '24px monospace';
  ctx.fillText(`Score: ${score}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
  ctx.restore();
  restartButton.draw(ctx);
};

export const drawWinScreen = (ctx, score, restartButton) => {
  ctx.save();
  ctx.fillStyle = 'rgba(0,80,0,0.85)';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#f8d800';
  ctx.font = 'bold 52px monospace';
  ctx.fillText('YOU WIN!', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 60);
  ctx.fillStyle = '#fff';
  ctx.font = '24px monospace';
  ctx.fillText(`Score: ${score}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
  ctx.restore();
  restartButton.draw(ctx);
};
