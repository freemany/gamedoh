// Grid
export const COLS = 15;
export const ROWS = 13;
export const TILE_SIZE = 64; // px per tile (64×64 as per design)
export const BLOCK_SIZE = 4; // for drawShape sprite rendering

// Tile types
export const TILE_EMPTY = 0;
export const TILE_HARD = 1;
export const TILE_SOFT = 2;

// Canvas dimensions
export const GRID_OFFSET_Y = 90; // header bar height (gap above the grid)
export const CANVAS_WIDTH = COLS * TILE_SIZE; // 960
export const CANVAS_HEIGHT = ROWS * TILE_SIZE + GRID_OFFSET_Y; // 922

// Game loop
export const HEART_BEAT = 16; // ~60fps

// Lives
export const LIVES = 3;

// Player
export const PLAYER_SPEED = 2.5; // px per frame
export const PLAYER_MARGIN = 10; // px inset for collision bounding box
export const SNAP_TOLERANCE = PLAYER_SPEED + 3; // px, snaps perpendicular axis when this close to center
export const INVINCIBLE_FRAMES = 150; // ~2.5s at 60fps
export const DEFAULT_MAX_BOMBS = 1;
export const DEFAULT_FIRE_POWER = 2;

// Bomb
export const BOMB_FUSE_FRAMES = 180; // 3s at 60fps

// Flame
export const FLAME_DURATION = 50; // frames

// Enemy speeds (px per frame)
export const WANDERER_SPEED = 1.0;
export const HUNTER_SPEED = 1.4;
export const GHOST_SPEED = 0.9;
export const RUNNER_SPEED = 1.8;

// Timer
export const LEVEL_TIME = 180; // seconds (per level; overridden by LEVELS config)

// Scoring
export const ENEMY_SCORE = 100;
export const EXIT_SCORE = 200;

// Levels config
export const LEVELS = [
  {
    cols: 9, rows: 7,
    enemies: [{ type: 'wanderer', count: 3 }],
    softDensity: 0.45,
    timeLimit: 180,
  },
  {
    cols: 9, rows: 7,
    enemies: [
      { type: 'wanderer', count: 2 },
      { type: 'hunter', count: 1 },
      { type: 'runner', count: 1 },
    ],
    softDensity: 0.50,
    timeLimit: 150,
  },
  {
    cols: 11, rows: 13,
    enemies: [
      { type: 'wanderer', count: 2 },
      { type: 'hunter', count: 2 },
      { type: 'ghost', count: 1 },
      { type: 'runner', count: 1 },
    ],
    softDensity: 0.55,
    timeLimit: 120,
  },
];

// Item types
export const ITEM_BOMB_UP = 'BOMB_UP';
export const ITEM_FIRE_UP = 'FIRE_UP';
export const ITEM_HEART = 'HEART';
export const ITEM_REMOTE = 'REMOTE';
export const ITEM_PIERCE = 'PIERCE';
export const ITEM_KEY = 'KEY';
export const ITEM_EXIT = 'EXIT';

// Safe zone tiles always empty (player spawn area)
export const SAFE_TILES = [
  [0, 0], [1, 0], [0, 1], [2, 0],
];

// Enemy spawn positions (col, row) — far from player spawn (0,0)
export const ENEMY_SPAWN_POSITIONS = [
  [14, 12], [14, 0], [0, 12], [12, 12], [12, 0],
  [10, 12], [10, 0], [14, 6], [0, 6], [7, 12],
];
