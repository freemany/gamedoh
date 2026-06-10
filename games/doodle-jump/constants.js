export const BLOCK_SIZE = 3;
export const CANVAS_WIDTH = 400;
export const CANVAS_HEIGHT = 600;
export const HEART_BEAT = 33; // ~30fps
export const LIVES = 1;
export const INITIAL_SPEED = 1;
export const MAX_SPEED = 3;
export const SPEED_UP_EVERY = 5;

// Player sprite: 20 cols × 25 rows
export const PLAYER_W = 20 * BLOCK_SIZE; // 60px
export const PLAYER_H = 25 * BLOCK_SIZE; // 75px

// Physics
export const GRAVITY = 0.5;
export const JUMP_VY = -14;
export const MOVE_SPEED = 4;

// Levels — 10 seconds each
export const LEVELS = [10, 10];

// Pixels the player must scroll up to clear each level
// At ~6 bounces/10s each scrolling ~196px = ~1176px max.
// L1: needs ~4 clean bounces. L2: needs ~5-6 with few misses.
export const LEVEL_TARGET = [700, 1000];

// Per-level platform config (index = level index)
export const LEVEL_PLATFORM_W   = [70, 48]; // level 2 has narrower platforms
export const LEVEL_PLATFORM_GAP = [80, 110]; // level 2 has bigger gaps

// Shared platform config
export const PLATFORM_H = 12;
export const PLATFORM_COUNT = 9;

// Invincibility (imported per CLAUDE.md convention)
export const INVINCIBLE_FRAMES = 60;
