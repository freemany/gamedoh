export const BLOCK_SIZE    = 2;
export const CANVAS_WIDTH  = 640;
export const CANVAS_HEIGHT = 320;
export const HEART_BEAT    = 33;
export const LIVES         = 7;
export const LEVELS        = [60, 60];
export const INITIAL_SPEED = 1;
export const MAX_SPEED     = 3;
export const SPEED_UP_EVERY = 5;

export const GRAVITY             = 0.5;
export const JUMP_VY             = -12;
export const MOVE_SPEED          = 3;
export const BULLET_SPEED        = 8;
export const SOLDIER_SPEED       = 1;
export const SHOOT_COOLDOWN      = 15;
export const ENEMY_SHOOT_INTERVAL = 90;
export const ENEMY_SHOOT_RANGE   = 300;

export const PLAYER_W  = 58;   // 29 cells × BLOCK_SIZE
export const PLAYER_H  = 58;
export const SOLDIER_W = 58;
export const SOLDIER_H = 58;

export const GROUND_Y    = 260;
export const WORLD_WIDTH = 2560;
export const WORLD_HEIGHT = 1600;
export const PLAT_H      = 20;
export const INVINCIBLE_FRAMES = 60;
export const KILL_SCORE  = 100;

export const LEVELS_DATA = [
  {
    type: 'horizontal',
    endX: 1300,
    platforms: [
      { x: 280, y: GROUND_Y - 80,  w: 160 },
      { x: 550, y: GROUND_Y - 140, w: 130 },
      { x: 850, y: GROUND_Y - 80,  w: 180 },
    ],
    soldiers: [450, 750, 1050],
  },
  {
    type: 'vertical',
    endY: 380,
    platforms: [
      { x: 100, y: 1480, w: 220 },
      { x: 280, y: 1380, w: 220 },
      { x: 100, y: 1280, w: 220 },
      { x: 280, y: 1180, w: 220 },
      { x: 100, y: 1080, w: 220 },
      { x: 280, y:  980, w: 220 },
      { x: 100, y:  880, w: 220 },
      { x: 280, y:  780, w: 220 },
      { x: 100, y:  680, w: 220 },
      { x: 280, y:  580, w: 220 },
      { x: 160, y:  480, w: 220 },
    ],
    soldiers: [
      { x: 140, y: 1480 },
      { x: 360, y: 1380 },
      { x: 140, y: 1280 },
      { x: 360, y: 1180 },
      { x: 140, y: 1080 },
      { x: 360, y:  980 },
      { x: 140, y:  880 },
    ],
  },
];
