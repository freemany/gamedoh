import Game from './game.js';
import Fighter from './fighter/index.js';
import { buildFormation, buildSmallFormation, buildBossFormation } from './enemy/index.js';
import inputHandler from './inputHandler.js';
import {
  CANVAS_WIDTH, CANVAS_HEIGHT, FIGHTER_W, PLAYER_Y, INVINCIBLE_FRAMES,
} from './constants.js';

const canvas  = document.getElementById('gameCanvas');
const loading = document.getElementById('loading');
canvas.width  = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;

const ctx  = canvas.getContext('2d');
const game = new Game(ctx, { canvas });

const setupLevel = () => {
  const cfg = game.level.config;
  game.enemies      = cfg.boss ? buildBossFormation(game)
    : cfg.challenging ? []
    : cfg.smallFormation ? buildSmallFormation(game)
    : buildFormation(game);
  game.enemyBullets = [];
  game._oscillationTick = 0;
  game._capturedShip    = null;
  game._challenging     = false;

  if (!game.fighter) {
    game.fighter = new Fighter(game);
  } else {
    game.fighter.x       = CANVAS_WIDTH / 2 - FIGHTER_W / 2;
    game.fighter.dual    = false;
    game.fighter.bullets = [];
    if (game.fighter.enterState) game.fighter.enterState('IDLE');
  }

  game._pendingLevelStart = true;
};

game.onLevelAdvance = () => setupLevel();

game.onRestart = () => {
  game.level.reset();
  game.fighter = null;
  setupLevel();
};

inputHandler(game);
setupLevel();

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
  loading.style.display = 'none';
  canvas.style.display  = 'block';
  game.init();
  game.startButton.y += 100;
  game.drawStartScreen(); // redraw so visual matches the new click target
})();
