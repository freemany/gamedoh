export const BLOCK_SIZE = 5;
export const CANVAS_WIDTH = 600;
export const CANVAS_HEIGHT = 450;
export const HEART_BEAT = 16; // ~60fps

export const LIVES = 3;

export const LEVELS = [
  { rows: 4, speed: 3 },
  { rows: 6, speed: 3.5 },
  { rows: 8, speed: 4 },
];

// Brick grid
export const BRICK_COLS = 10;
export const BRICK_W = 52; // px
export const BRICK_H = 18; // px
export const BRICK_GAP = 4; // px between bricks
export const BRICK_TOP = 60; // px from top
export const BRICK_COLORS = [
  '#e53935',
  '#fb8c00',
  '#fdd835',
  '#43a047',
  '#1e88e5',
  '#8e24aa',
  '#00acc1',
  '#f06292',
];

// Paddle
export const PADDLE_W = 100; // px
export const PADDLE_H = 14; // px
export const PADDLE_SPEED = 6; // px per frame
export const PADDLE_Y = CANVAS_HEIGHT - 40; // px from top

// Ball
export const BALL_SIZE = 12; // px (square hitbox)
export const BALL_SPEED_INCREMENT = 0.15; // added to speed each paddle hit

// Scoring
export const BRICK_SCORE = 10;
