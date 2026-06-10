import Game from './game.js';
import Player from './player/index.js';
import Soldier from './soldier/index.js';
import Cannon, { CANNON_W, CANNON_H } from './cannon/index.js';
import Flag, { FLAG_W, FLAG_H } from './flag.js';
import inputHandler from './inputHandler.js';
import {
  CANVAS_WIDTH, CANVAS_HEIGHT, PLAYER_W, PLAYER_H,
  SOLDIER_H, GROUND_Y, WORLD_HEIGHT, LEVELS_DATA, INVINCIBLE_FRAMES, LIVES,
} from './constants.js';

const canvas = document.getElementById('gameCanvas');
canvas.width  = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;
const ctx = canvas.getContext('2d');

const game = new Game(ctx, { canvas });

const spawnPlayer = () => {
  const levelData = LEVELS_DATA[game.level.index];
  const startY = levelData.type === 'vertical'
    ? WORLD_HEIGHT - PLAYER_H - 20
    : GROUND_Y - PLAYER_H;
  game.player = new Player(game, 50, startY);
};

const spawnSoldiers = () => {
  const levelData = LEVELS_DATA[game.level.index];
  game.soldiers = levelData.soldiers.map(s =>
    typeof s === 'number'
      ? new Soldier(game, s, GROUND_Y - SOLDIER_H)
      : new Soldier(game, s.x, s.y - SOLDIER_H)
  );
};

const spawnCannons = () => {
  const levelData = LEVELS_DATA[game.level.index];
  const cannons = [];

  if (levelData.type === 'vertical') {
    // One cannon per platform, 60% chance
    for (const p of levelData.platforms) {
      if (p.w >= CANNON_W && Math.random() < 0.6) {
        const cx = p.x + Math.floor(Math.random() * (p.w - CANNON_W));
        cannons.push(new Cannon(game, cx, p.y - CANNON_H));
      }
    }
  } else {
    // Ground cannons
    for (let x = 250; x < levelData.endX - 100; x += 500) {
      cannons.push(new Cannon(game, x + Math.floor(Math.random() * 80), GROUND_Y - CANNON_H));
    }
    // Platform cannons — 50% chance
    for (const p of levelData.platforms) {
      if (p.w >= CANNON_W && Math.random() < 0.5) {
        const cx = p.x + Math.floor(Math.random() * (p.w - CANNON_W));
        cannons.push(new Cannon(game, cx, p.y - CANNON_H));
      }
    }
  }

  game.cannons = cannons;
};

const spawnFlags = () => {
  const levelData = LEVELS_DATA[game.level.index];
  const spots = [];

  if (levelData.type === 'vertical') {
    // One flag per platform
    for (const p of levelData.platforms) {
      if (p.w >= FLAG_W) {
        spots.push({ x: p.x + Math.floor(Math.random() * (p.w - FLAG_W)), y: p.y - FLAG_H });
      }
    }
  } else {
    for (let x = 180; x < levelData.endX - 100; x += 350) {
      spots.push({ x: x + Math.floor(Math.random() * 60), y: GROUND_Y - FLAG_H });
    }
    for (const p of levelData.platforms) {
      if (p.w >= FLAG_W) {
        spots.push({ x: p.x + Math.floor(Math.random() * (p.w - FLAG_W)), y: p.y - FLAG_H });
      }
    }
  }

  spots.sort(() => Math.random() - 0.5);
  game.flags = spots.slice(0, 6).map(s => new Flag(s.x, s.y));
};

const resetCamera = () => {
  game.cameraX     = 0;
  game.cameraY     = 0;
  const isVertical = LEVELS_DATA[game.level.index].type === 'vertical';
  game.worldBottom = isVertical ? WORLD_HEIGHT + 20 : CANVAS_HEIGHT + 20;
};

const setupGame = () => {
  game.level.reset();
  game._timerStarted = false;
  game._levelBanner  = 0;
  game._lastAliveX   = null;
  game._lastAliveY   = null;
  game.bullets       = [];
  resetCamera();
  game.setupTerrain();
  spawnPlayer();
  spawnSoldiers();
  spawnCannons();
  spawnFlags();
};

game.onLevelSetup = () => {
  game.lives       = LIVES;
  game._lastAliveX = null;
  game._lastAliveY = null;
  game.bullets     = [];
  resetCamera();
  spawnPlayer();
  spawnSoldiers();
  spawnCannons();
  spawnFlags();
};

game.onLoseLife = () => {
  // game.lives already decremented by super.loseLife()
  if (game.lives > 0) {
    game.bullets = game.bullets.filter(b => b.owner !== 'player');
    if (game._lastAliveX != null) {
      game.player = new Player(game, game._lastAliveX, game._lastAliveY);
    } else {
      spawnPlayer();
    }
    game.player.flash.trigger(INVINCIBLE_FRAMES);
  }
};

game.onRestart = setupGame;

setupGame();
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
