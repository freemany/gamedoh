import Game from './game.js';
import Player from './player/index.js';
import { createEnemy } from './enemy/index.js';
import inputHandler from './inputHandler.js';
import { buildGrid, placeHiddenItems } from './mapBuilder.js';
import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  HEART_BEAT,
  TILE_SIZE,
  ENEMY_SPAWN_POSITIONS,
  TILE_SOFT,
  TILE_EMPTY,
} from './constants.js';

const canvas = document.getElementById('gameCanvas');
canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;
const ctx = canvas.getContext('2d');

const game = new Game(ctx, { canvas });

// ── Enemy spawning ────────────────────────────────────────────────────────────

const spawnEnemies = (enemyConfig) => {
  const enemies = [];
  const usedPositions = new Set();
  let posIdx = 0;

  // Filter spawn positions to those within the current grid
  const validSpawns = ENEMY_SPAWN_POSITIONS.filter(
    ([col, row]) => col < game.cols && row < game.rows
  );

  for (const { type, count } of enemyConfig) {
    for (let i = 0; i < count; i++) {
      while (posIdx < validSpawns.length) {
        const [col, row] = validSpawns[posIdx++];
        const key = `${col},${row}`;
        if (usedPositions.has(key)) continue;

        if (game.grid[row][col] === TILE_SOFT) game.grid[row][col] = TILE_EMPTY;
        usedPositions.add(key);
        enemies.push(createEnemy(type, game, col, row));
        break;
      }
    }
  }

  return enemies;
};

// ── Level setup ───────────────────────────────────────────────────────────────

const setupLevel = () => {
  const cfg = game.level.config;

  // Dynamic grid dimensions — centered on canvas
  game.cols = cfg.cols;
  game.rows = cfg.rows;
  game.gridOffsetX = Math.floor((CANVAS_WIDTH - cfg.cols * TILE_SIZE) / 2);

  game.grid = buildGrid(cfg.cols, cfg.rows, cfg.softDensity);
  game.hiddenItems = placeHiddenItems(game.grid, cfg.rows, cfg.cols);
  game.hasKey = false;
  game.exitVisible = false;
  game.exitCol = -1;
  game.exitRow = -1;
  game.bombs = [];
  game.flames = [];
  game.items = [];
  game._advancingLevel = false;
  game._keyMessageTimer = 0;
  game._timerMs = cfg.timeLimit * 1000;

  game.player = new Player(game, 0, 0);
  game.enemies = spawnEnemies(cfg.enemies);
  game._pendingLevelStart = true;
};

// ── Callbacks ─────────────────────────────────────────────────────────────────

// Called when player reaches the exit — rebuilds the level with new config
game.onLevelAdvance = () => {
  setupLevel();
};

// Called when player clicks RESTART on the game-over screen
game.onRestart = () => {
  game.level.reset();
  setupLevel();
};

// ── Boot ──────────────────────────────────────────────────────────────────────

setupLevel();
inputHandler(game);

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
