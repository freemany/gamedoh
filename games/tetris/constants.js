// Canvas
export const BLOCK_SIZE     = 1;        // kept for BaseGame compat; drawing uses CELL
export const CANVAS_WIDTH   = 410;
export const CANVAS_HEIGHT  = 640;
export const HEART_BEAT     = 33;       // ms per frame (~30 fps)

// BaseGame config (Tetris manages speed internally)
export const LIVES          = 1;
export const LEVELS         = [999];    // no timer-based level end
export const INITIAL_SPEED  = 1;
export const MAX_SPEED      = 1;
export const SPEED_UP_EVERY = 9999;

// Board geometry
export const COLS     = 10;
export const ROWS     = 20;
export const CELL     = 28;            // px per board cell
export const BOARD_X  = 20;           // left edge of board
export const BOARD_Y  = 40;           // top edge of board

// Sidebar
export const SIDEBAR_X = BOARD_X + COLS * CELL + 20;  // 320

// Auto-drop speed (frames between gravity ticks)
export const DROP_FRAMES_START = 45;   // ~1.5 s at 30 fps
export const DROP_FRAMES_MIN   = 5;    // fastest possible
export const SPEED_UP_LINES    = 10;   // lines per level step

// Scoring
export const SCORE_1 = 100;
export const SCORE_2 = 300;
export const SCORE_3 = 500;
export const SCORE_4 = 800;
export const SOFT_DROP_SCORE = 1;     // per row
export const HARD_DROP_SCORE = 2;     // per row
