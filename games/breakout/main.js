import Game from './game.js';
import Ball from './ball.js';
import Paddle from './paddle.js';
import Brick from './brick.js';
import inputHandler from './inputHandler.js';
import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  BRICK_COLS,
  BRICK_W,
  BRICK_H,
  BRICK_GAP,
  BRICK_TOP,
  BRICK_COLORS,
} from './constants.js';

const canvas = document.getElementById('gameCanvas');
canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;
const ctx = canvas.getContext('2d');

const game = new Game(ctx, { canvas });

const buildBricks = (rows) => {
  const bricks = [];
  const totalW = BRICK_COLS * BRICK_W + (BRICK_COLS - 1) * BRICK_GAP;
  const offsetX = (CANVAS_WIDTH - totalW) / 2;

  for (let row = 0; row < rows; row++) {
    const color = BRICK_COLORS[row % BRICK_COLORS.length];
    for (let col = 0; col < BRICK_COLS; col++) {
      const x = offsetX + col * (BRICK_W + BRICK_GAP);
      const y = BRICK_TOP + row * (BRICK_H + BRICK_GAP);
      bricks.push(new Brick(x, y, color));
    }
  }
  return bricks;
};

const setupGame = () => {
  game.paddle = new Paddle(game);
  game.ball = new Ball(game);
  game.bricks = [];
  game._pendingLevelStart = true;
};

game.onLevelSetup = () => {
  game.bricks = buildBricks(game.level.rows);
  game.ball.setSpeed(game.level.speed);
  game.ball.reset();
};

game.onRestart = () => {
  game.level.reset();
  setupGame();
};

inputHandler(game);
setupGame();

const loadAssets = () =>
  new Promise((resolve) => {
    if (document.readyState === 'complete') {
      resolve();
    } else {
      window.addEventListener('load', resolve);
    }
  });

(async () => {
  await loadAssets();
  document.getElementById('loading').style.display = 'none';
  document.getElementById('gameCanvas').style.display = 'block';
  game.init();
})();
