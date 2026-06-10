export const BLOCK_SIZE = 2;
export const FIGHTER_BLOCK_SIZE = BLOCK_SIZE; // 2px per sprite cell — sprite matrix is 3× bigger
export const HEART_BEAT = 100; // ms per tick
export const CANVAS_WIDTH = 1200;
export const CANVAS_HEIGHT = 600;

export const GAME_STATE = {
  START: 'START',
  PLAYING: 'PLAYING',
  OVER: 'OVER',
};

// Fighter movement — all values in fighter-grid-units (1 unit = 2px)
// Sprite is now 60×72 (3× the base 20×24); scale speeds accordingly
export const FIGHTER_SPEED = 6;  // 12px/tick
export const GRAVITY = 3;        // 6px/tick²
export const JUMP_FORCE = -22;   // jump height matches new grid
// Canvas = 600/2 = 300 fighter-units tall; sprite is 50 rows tall
export const GROUND_Y = Math.floor(CANVAS_HEIGHT / FIGHTER_BLOCK_SIZE) - 50; // = 250

// States
export const IDLE       = 'IDLE';
export const WALK_LEFT  = 'WALK_LEFT';
export const WALK_RIGHT = 'WALK_RIGHT';
export const JUMP       = 'JUMP';
export const PUNCH      = 'PUNCH';
export const KICK       = 'KICK';
export const CROUCH     = 'CROUCH';
export const STUN       = 'STUN';
export const DEAD       = 'DEAD';

// Enemy archetypes — stats are multiplied on top of level base values
export const ENEMY_TYPES = {
  grunt:   { speedMult: 1,    hpMult: 1,   damageMult: 1, cooldownMult: 1,   attackRange: 30, label: 'ENEMY',   color: null },   // color set by spawn alternation (r/b)
  brawler: { speedMult: 0.55, hpMult: 2.5, damageMult: 2, cooldownMult: 1.5, attackRange: 42, label: 'BRAWLER', color: 'g' },    // green
  rusher:  { speedMult: 2,    hpMult: 0.4, damageMult: 1, cooldownMult: 0.4, attackRange: 30, label: 'RUSHER',  color: 'y' },    // yellow
};

// Levels — each stage spawns enemyCount enemies with increasing difficulty
export const LEVELS = [
  { stage: 1, enemyCount: 3, enemyHp: 60,  enemySpeed: 3, attackCooldown: 20,
    enemyTypes: ['grunt', 'grunt', 'grunt'] },
  { stage: 2, enemyCount: 5, enemyHp: 80,  enemySpeed: 4, attackCooldown: 16,
    enemyTypes: ['grunt', 'brawler', 'grunt', 'grunt', 'brawler'] },
  { stage: 3, enemyCount: 7, enemyHp: 100, enemySpeed: 5, attackCooldown: 12,
    enemyTypes: ['rusher', 'grunt', 'brawler', 'rusher', 'grunt', 'brawler', 'rusher'] },
];

// Transition timing (ms)
export const STAGE_CLEAR_DELAY    = 0;
export const LEVEL_INTRO_DURATION = 1000;

// Combat
export const PLAYER_MAX_HEALTH     = 100;
export const PUNCH_DAMAGE          = 15;
export const KICK_DAMAGE           = 20;
export const ATTACK_COOLDOWN_TICKS = 15;  // invincibility ticks after being hit (~1.5s)
export const BLOCK_DAMAGE          = 3;   // damage when player crouches into a punch
export const STUN_TICKS            = 7;   // ~700ms enemy stun

// Hitbox offsets in fighter-grid-units (sprite = 50 cols wide; body ≈ cols 15–35)
// Right-facing: hitbox at (entity.x + xOffset). Left-facing: mirrored.
export const PUNCH_HITBOX = { xOffset: 20, yOffset: 5,  width: 18, height: 12 };
export const KICK_HITBOX  = { xOffset: 18, yOffset: 20, width: 22, height: 12 };
export const HURTBOX      = { xOffset: 8,  yOffset: 0,  width: 34, height: 50 };

// Platforms — empty (removed floating platforms from background)
export const PLATFORMS = [];
export const PLATFORM_SNAP = 8;

// Enemy AI
export const ENEMY_ATTACK_RANGE      = 30;  // grid-units — close enough for hits to land
export const MAX_ENEMIES_ON_SCREEN   = 2;
export const ENEMY_SPAWN_DELAY_TICKS = 15;  // ticks between enemy spawns

// Jump attacks
export const JUMP_PUNCH        = 'JUMP_PUNCH';
export const JUMP_KICK         = 'JUMP_KICK';
export const JUMP_PUNCH_DAMAGE = 20;  // slightly stronger than ground punch
export const JUMP_KICK_DAMAGE  = 25;  // slightly stronger than ground kick

// Knockback
export const KNOCKBACK_VX    = 8;  // grid-units pushed back on each hit
export const KNOCKBACK_TICKS = 3;  // duration of knockback (ticks)

// Lives & respawn
export const PLAYER_LIVES  = 3;
export const KO_DISPLAY_MS = 2000; // ms to show KO screen before respawn

// Combo
export const COMBO_TIMEOUT_TICKS = 20; // ticks of no hit before combo resets (~2s)

// Fatigue — spam protection
export const FATIGUE_THRESHOLD    = 8;  // consecutive attacks before forced rest
export const FATIGUE_COOLDOWN_SEC = 2;  // seconds of rest (drives GameTimer)
export const FATIGUE_SPREE_WINDOW = 8;  // ticks without attacking before spree resets

// Power-ups
export const POWERUP_DROP_CHANCE  = 0.35;  // probability enemy drops item on death
export const POWERUP_HEAL         = 25;    // HP restored by heart pickup
export const POWERUP_STAR_TICKS   = 50;   // ~5s of 2× damage
export const POWERUP_SHIELD_TICKS = 30;   // ~3s of full invincibility
