import { drawGrid } from './gamedoh-engine.js';
import { CANVAS_WIDTH, CANVAS_HEIGHT, BLOCK_SIZE } from './constants.js';

export const drawStartScreen = (ctx, startButton) => {
  ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  drawGrid(ctx, CANVAS_WIDTH / BLOCK_SIZE, CANVAS_HEIGHT / BLOCK_SIZE, BLOCK_SIZE);

  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Title
  ctx.font = 'bold 48px Courier';
  ctx.fillStyle = '#2d6a2d';
  ctx.fillText('Searching Carrot', CANVAS_WIDTH / 2, 80);

  // Goal
  ctx.font = 'bold 18px Arial';
  ctx.fillStyle = '#333';
  ctx.fillText('GOAL', CANVAS_WIDTH / 2, 150);
  ctx.font = '16px Arial';
  ctx.fillStyle = '#555';
  ctx.fillText('Help the bunny find all carrots hidden in the field!', CANVAS_WIDTH / 2, 175);
  ctx.fillText('Complete all 3 levels before time runs out.', CANVAS_WIDTH / 2, 197);

  // How to play
  ctx.font = 'bold 18px Arial';
  ctx.fillStyle = '#333';
  ctx.fillText('HOW TO PLAY', CANVAS_WIDTH / 2, 240);
  ctx.font = '16px Arial';
  ctx.fillStyle = '#555';
  ctx.fillText('Arrow keys — move the bunny', CANVAS_WIDTH / 2, 265);
  ctx.fillText('Walk over a carrot to collect it', CANVAS_WIDTH / 2, 287);

  // Levels
  ctx.font = 'bold 18px Arial';
  ctx.fillStyle = '#333';
  ctx.fillText('LEVELS', CANVAS_WIDTH / 2, 330);
  ctx.font = '16px Arial';
  ctx.fillStyle = '#555';
  ctx.fillText('Level 1 — find 1 carrot  (10 sec)', CANVAS_WIDTH / 2, 355);
  ctx.fillText('Level 2 — find 3 carrots (15 sec)', CANVAS_WIDTH / 2, 377);
  ctx.fillText('Level 3 — find 5 carrots (20 sec)', CANVAS_WIDTH / 2, 399);

  // Tips
  ctx.font = 'bold 18px Arial';
  ctx.fillStyle = '#333';
  ctx.fillText('TIPS', CANVAS_WIDTH / 2, 440);
  ctx.font = '16px Arial';
  ctx.fillStyle = '#555';
  ctx.fillText('Carrots are hidden anywhere in the world — explore!', CANVAS_WIDTH / 2, 465);
  ctx.fillText('Watch the timer in the top-right corner.', CANVAS_WIDTH / 2, 487);
  ctx.fillText('Timer turns red when under 10 seconds remain.', CANVAS_WIDTH / 2, 509);

  ctx.restore();

  // Position and draw start button below the tips section
  startButton.x = CANVAS_WIDTH / 2 + 60;
  startButton.y = 558;
  startButton.draw(ctx);
};

export const drawPauseOverlay = (ctx) => {
  ctx.save();
  ctx.fillStyle = 'rgba(0,0,0,0.45)';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 40px Courier';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('PAUSED', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
  ctx.restore();
};

export const drawGameOverScreen = (ctx, score, restartButton) => {
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = 'bold 52px Courier';
  ctx.fillStyle = '#c0392b';
  ctx.fillText('Time Up!', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 40);
  ctx.font = '24px Arial';
  ctx.fillStyle = '#333';
  ctx.fillText(`Carrots collected: ${score}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 20);
  ctx.restore();
  restartButton.x = CANVAS_WIDTH / 2 + 60;
  restartButton.y = CANVAS_HEIGHT / 2 + 90;
  restartButton.draw(ctx);
};

export const drawWinScreen = (ctx, score, restartButton) => {
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = 'bold 52px Courier';
  ctx.fillStyle = '#2d6a2d';
  ctx.fillText('You Win!', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 40);
  ctx.font = '24px Arial';
  ctx.fillStyle = '#333';
  ctx.fillText(`Carrots collected: ${score}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 20);
  ctx.restore();
  restartButton.x = CANVAS_WIDTH / 2 + 60;
  restartButton.y = CANVAS_HEIGHT / 2 + 90;
  restartButton.draw(ctx);
};
