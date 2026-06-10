// Canvas — 3:4 vertical
export const CANVAS_WIDTH  = 480;
export const CANVAS_HEIGHT = 640;
export const BLOCK_SIZE    = 4;
export const HEART_BEAT    = 16; // ~60fps

// HUD
export const HUD_TOP_H    = 36;
export const HUD_BOTTOM_H = 48;

// Player
export const FIGHTER_W          = 40; // 10 units * BLOCK_SIZE
export const FIGHTER_H          = 32; // 8 units * BLOCK_SIZE
export const PLAYER_Y           = CANVAS_HEIGHT - HUD_BOTTOM_H - 56;
export const PLAYER_SPEED       = 4;
export const INVINCIBLE_FRAMES  = 150;
export const MAX_PLAYER_BULLETS = 2;
export const PLAYER_BULLET_SPEED = 9;

// Enemies
export const ENEMY_BULLET_SPEED = 3;
export const ENEMY_FIRE_RATE    = 0.003; // probability per frame per DIVING enemy

// Formation
export const FORM_ROWS  = 5;
export const FORM_COLS  = 10; // 5 left + 5 right
export const CELL_W     = 36;
export const CELL_H     = 32;
export const FORM_GAP   = 24;  // px gap between left and right halves
export const FORM_TOP_Y = HUD_TOP_H + 32;

// Enemy types
export const TYPE_ZAKOZAKO = 'ZAKOZAKO';
export const TYPE_GOEI     = 'GOEI';
export const TYPE_BOSS     = 'BOSS';

// Scores
export const SCORE_ZAKOZAKO_FORM = 50;
export const SCORE_ZAKOZAKO_DIVE = 100;
export const SCORE_GOEI_FORM     = 80;
export const SCORE_GOEI_DIVE     = 160;
export const SCORE_BOSS_FORM     = 150;
export const SCORE_BOSS_DIVE     = 400;
export const SCORE_RESCUE_BONUS  = 1000;

// Tractor beam
export const TRACTOR_BEAM_FRAMES = 100;
export const TRACTOR_BEAM_W      = 28;

// Dive
export const DIVE_SPEED        = 3.5;
export const DIVE_RETURN_SPEED = 2.5;

// Challenging stage
export const CHALLENGING_WAVE_BONUS    = 1000;
export const CHALLENGING_PERFECT_BONUS = 10000;

// Levels config
export const LEVELS = [
  { challenging: false, maxDivers: 1, fireRate: 0.002, smallFormation: true },
  { challenging: true,  maxDivers: 0, fireRate: 0 },
  { challenging: false, maxDivers: 2, fireRate: 0.004 },
  { boss: true,         maxDivers: 4, fireRate: 0.008 },
];

export const LIVES = 3;

// Delay (ms) between last enemy death and advancing to the next stage
export const STAGE_CLEAR_DELAY = 0;
