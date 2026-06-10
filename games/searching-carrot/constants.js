export const BLOCK_SIZE = 5;
export const HEART_BEAT = 100; // game loop interval in ms
export const WORLD_WIDTH = 150; // grid units
export const WORLD_HEIGHT = 150; // grid units
export const CANVAS_WIDTH = 600;
export const CANVAS_HEIGHT = 600;
export const BUNNY_SPEED = 2; // grid units per tick

export const LEVELS = [
  { carrotCount: 1, timeLimit: 10 },
  { carrotCount: 3, timeLimit: 15 },
  { carrotCount: 5, timeLimit: 20 },
];

export const IDLE = 'IDLE';
export const UP = 'UP';
export const DOWN = 'DOWN';
export const LEFT = 'LEFT';
export const RIGHT = 'RIGHT';
export const EAT = 'EAT';

// Bunny sprite dimensions in grid units (8 wide × 11 tall)
export const BUNNY_HALF_W = 4; // Math.ceil(8 / 2)
export const BUNNY_HALF_H = 6; // Math.ceil(11 / 2)

export const CARROT_HIT_RADIUS = 4; // grid units — collision tolerance
export const ROCK_COUNT = 40;
