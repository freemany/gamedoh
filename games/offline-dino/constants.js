export const BLOCK_SIZE = 5;
export const CANVAS_WIDTH = 800;
export const CANVAS_HEIGHT = 350;
export const GROUND_HEIGHT = 8; // grid units
export const HEART_BEAT = 30; // ms per frame

export const GRAVITY = 0.6;
export const JUMP_FORCE = -8;

export const INITIAL_SPEED = 1.5;
export const MAX_SPEED = 5;
export const SPEED_UP_EVERY = 200; // score points between speed bumps

export const LIVES = 3;
export const OBSTACLE_COUNT = 3;
export const BIRD_COUNT = 2;
export const OBSTACLE_SPACING = 55; // grid units between obstacles

export const LEVELS = [10, 15, 20]; // seconds per level

export const INVINCIBILITY_FRAMES = 60; // ~2 seconds at 30ms/frame

// States
export const RUN = 'RUN';
export const JUMP = 'JUMP';
export const DUCK = 'DUCK';
