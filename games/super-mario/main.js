import Game from './game.js';
import Mario from './mario/index.js';
import Goomba from './goomba/index.js';
import inputHandler from './inputHandler.js';
import { CANVAS_WIDTH, CANVAS_HEIGHT, TILE_SIZE, BLOCK_SIZE, INVINCIBLE_FRAMES } from './constants.js';
import { LEVEL_1, LEVEL_2 } from './tilemap.js';

const LAYOUTS = [LEVEL_1, LEVEL_2];

const canvas = document.getElementById('gameCanvas');
canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;
const ctx = canvas.getContext('2d');

const game = new Game(ctx, { canvas });

const spawnGoombas = (layout) =>
  layout.goombas.map((g) => new Goomba(game, g.x * TILE_SIZE * BLOCK_SIZE));

const resetGameState = () => {
  game.mushrooms = [];
  game.coins = [];
  game.blockHits = new Map();
  game.spawnedPipes = new Set();
  game.cameraX = 0;
};

const setupGame = () => {
  game.mario = new Mario(game);
  game.goombas = spawnGoombas(LEVEL_1);
  game._wasTimeUp = false;
  resetGameState();
};

const resetResources = () => {
  const layout = LAYOUTS[Math.min(game.level.index, LAYOUTS.length - 1)];
  game.mario = new Mario(game);
  game.goombas = spawnGoombas(layout);
  resetGameState();
};

game.onLoseLife = () => {
  const spawnX = game._respawnX || 64;
  game.mario = new Mario(game, spawnX);
  game.mario.flash.trigger(INVINCIBLE_FRAMES);
  game.cameraX = Math.max(0, spawnX - CANVAS_WIDTH / 2);
};

setupGame();
game.onRestart = setupGame;
game.onLevelSetup = resetResources;

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
