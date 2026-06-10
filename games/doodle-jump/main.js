import Game from './game.js';
import Player from './player/index.js';
import inputHandler from './inputHandler.js';
import { CANVAS_WIDTH, CANVAS_HEIGHT, PLAYER_W, PLAYER_H, JUMP_VY } from './constants.js';

const canvas = document.getElementById('gameCanvas');
canvas.width  = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;
const ctx = canvas.getContext('2d');

const game = new Game(ctx, { canvas });

const spawnPlayer = () => {
  const startX = CANVAS_WIDTH / 2 - PLAYER_W / 2;
  const startY = CANVAS_HEIGHT - 80 - PLAYER_H;
  game.player = new Player(game, startX, startY);
  game.player.vy = JUMP_VY; // kick off with first jump
};

const setupGame = () => {
  game.level.reset();
  game._timerStarted = false;
  game._levelBanner  = 0;
  game._levelScroll  = 0;
  game.initPlatforms();
  spawnPlayer();
};

// Between levels: reset per-level scroll, reinit platforms and player
game.onLevelSetup = () => {
  game._levelScroll = 0;
  game.initPlatforms();
  spawnPlayer();
};

setupGame();
game.onRestart = setupGame;

inputHandler(game);

const loadAssets = () =>
  new Promise((resolve) => {
    if (document.readyState === 'complete') resolve();
    else window.addEventListener('load', resolve);
  });

(async () => {
  await loadAssets();
  document.getElementById('loading').style.display = 'none';
  document.getElementById('gameCanvas').style.display = 'block';
  game.init();
})();
