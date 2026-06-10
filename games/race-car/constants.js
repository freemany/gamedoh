export const BLOCK_SIZE = 5;
export const CANVAS_WIDTH = 480;
export const CANVAS_HEIGHT = 600;
export const HEART_BEAT = 30; // ms per frame

export const INITIAL_SPEED = 2;
export const MAX_SPEED = 6;
export const SPEED_UP_EVERY = 15; // score points between speed bumps

export const LIVES = 2;
export const LEVELS = [10, 20]; // seconds per level
export const INVINCIBILITY_FRAMES = 60; // ~2 seconds at 30ms/frame

export const LANE_POSITIONS = [14, 43, 72]; // grid x (car left edge) per lane
export const BOSS_POSITIONS = [9, 38, 67];  // grid x for 20-wide boss (3 zones)
export const OPPONENT_COUNT = 3;
export const OPPONENT_SPACING = 40; // grid units vertical gap between opponents

// Player car states
export const IDLE = 'IDLE';
export const MOVING_LEFT = 'MOVING_LEFT';
export const MOVING_RIGHT = 'MOVING_RIGHT';
