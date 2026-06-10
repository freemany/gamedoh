export const BLOCK_SIZE = 4;       // px per sprite pixel
export const TILE_SIZE = 16;       // sprite blocks per tile width (64px rendered)
export const TILE_HEIGHT = BLOCK_SIZE * 8; // sprite tile height in px = 32px (8 rows × 4px)
export const CANVAS_WIDTH = 640;
export const CANVAS_HEIGHT = 384;
export const HEART_BEAT = 33;      // ms per frame (~30fps)

export const LIVES = 3;
export const LEVELS = [60, 60];    // seconds per level
export const INITIAL_SPEED = 1;
export const MAX_SPEED = 1;
export const SPEED_UP_EVERY = 9999;

// Physics (in pixels)
export const GRAVITY = 0.45;
export const JUMP_VY = -12;
export const MOVE_SPEED = 3;
export const GOOMBA_SPEED = 1;

// World
export const WORLD_WIDTH = 2560;   // 4× canvas width
export const GROUND_Y = CANVAS_HEIGHT - TILE_SIZE * BLOCK_SIZE; // top of ground row in px

// Score
export const STOMP_SCORE = 5;
export const MUSHROOM_SCORE = 20;
export const COIN_SCORE = 10;

// Sprite-specific block sizes
export const MARIO_BLOCK_SIZE    = 4;  // original size
export const GOOMBA_BLOCK_SIZE   = 2;  // BLOCK_SIZE × 0.5
export const MUSHROOM_BLOCK_SIZE = 4;

// Mario sprite size in px
export const MARIO_W = 12 * MARIO_BLOCK_SIZE;  // 48px
export const MARIO_H = 14 * MARIO_BLOCK_SIZE;  // 56px

// Goomba sprite size in px
export const GOOMBA_W = 12 * GOOMBA_BLOCK_SIZE; // 24px
export const GOOMBA_H = 10 * GOOMBA_BLOCK_SIZE; // 20px

// Mushroom sprite size in px
export const MUSHROOM_W = 8 * MUSHROOM_BLOCK_SIZE; // 16px
export const MUSHROOM_H = 8 * MUSHROOM_BLOCK_SIZE; // 16px
export const MUSHROOM_SPEED = 1;

// Invincibility flash duration after respawn (~2 seconds at 30fps)
export const INVINCIBLE_FRAMES = 60;
