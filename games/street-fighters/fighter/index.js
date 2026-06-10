import { drawShape, GameTimer } from '../gamedoh-engine.js';
import { colorizeFrame } from '../spriteUtils.js';
import { playSound } from '../sounds.js';
import {
  IDLE, WALK_LEFT, WALK_RIGHT, PUNCH, KICK, CROUCH, JUMP,
  GROUND_Y, GRAVITY, JUMP_FORCE, CANVAS_WIDTH, FIGHTER_BLOCK_SIZE,
  PLATFORMS, PLATFORM_SNAP,
  PLAYER_MAX_HEALTH, ATTACK_COOLDOWN_TICKS, BLOCK_DAMAGE,
  JUMP_PUNCH, JUMP_KICK,
  KNOCKBACK_VX, KNOCKBACK_TICKS,
  PUNCH_HITBOX, KICK_HITBOX, HURTBOX,
  FATIGUE_THRESHOLD, FATIGUE_COOLDOWN_SEC, FATIGUE_SPREE_WINDOW, HEART_BEAT,
} from '../constants.js';
import {
  IdleState, WalkLeftState, WalkRightState,
  PunchState, KickState, CrouchState, JumpState,
  JumpPunchState, JumpKickState,
} from './states.js';

class Fighter {
  constructor(game) {
    this.game = game;
    this.x = 10; // fighter-grid-units
    this.y = GROUND_Y;
    this.vy = 0;
    this.isOnGround = true;
    this.facingRight = true;

    // White gi (no palette swap)
    this._palette = {};

    // Health
    this.health    = PLAYER_MAX_HEALTH;
    this.maxHealth = PLAYER_MAX_HEALTH;
    this._hitCooldown = 0;
    this._knockbackVx    = 0;
    this._knockbackTicks = 0;
    this._attackSpree    = 0;
    this._spreeWindow    = 0;
    this._fatigued        = false;
    this._fatigueAnimTick = 0;
    this._fatigueTimer   = new GameTimer(
      FATIGUE_COOLDOWN_SEC, HEART_BEAT,
      null,
      () => { this._fatigued = false; },
    );

    this.states = {
      [IDLE]:       new IdleState(this),
      [WALK_LEFT]:  new WalkLeftState(this),
      [WALK_RIGHT]: new WalkRightState(this),
      [PUNCH]:      new PunchState(this),
      [KICK]:       new KickState(this),
      [CROUCH]:     new CrouchState(this),
      [JUMP]:       new JumpState(this),
      [JUMP_PUNCH]: new JumpPunchState(this),
      [JUMP_KICK]:  new JumpKickState(this),
    };
    this.enterState(IDLE);
  }

  get width()  { return this.currentState.image.getWidth(); }
  get height() { return this.currentState.image.getHeight(); }

  enterState(state) {
    if (this.currentState?.state === state) return;
    // Track consecutive attacks for fatigue
    if (state === PUNCH || state === KICK || state === JUMP_PUNCH || state === JUMP_KICK) {
      this._attackSpree++;
      this._spreeWindow = FATIGUE_SPREE_WINDOW;
      if (this._attackSpree >= FATIGUE_THRESHOLD) {
        this._fatigued        = true;
        this._fatigueAnimTick = 0;
        this._attackSpree     = 0;
        this._spreeWindow     = 0;
        this._fatigueTimer.restart();
        return; // cancel this attack — force idle
      }
    }
    this.currentState = this.states[state];
    this.currentState.enter();
  }

  receiveHit(damage, attackType, knockDir = 0) {
    if (this._hitCooldown > 0) return;
    // Crouching blocks punches — minimal chip damage, clash sound
    if (this.currentState.state === CROUCH && attackType === PUNCH) {
      this.health = Math.max(0, this.health - BLOCK_DAMAGE);
      this._hitCooldown = ATTACK_COOLDOWN_TICKS;
      playSound('clash');
      return;
    }
    this.health = Math.max(0, this.health - damage);
    this._hitCooldown = ATTACK_COOLDOWN_TICKS;
    this._knockbackVx    = knockDir * KNOCKBACK_VX;
    this._knockbackTicks = KNOCKBACK_TICKS;
    playSound('got_hit');
  }

  // Returns attack hitbox in canvas pixels, mirrored for left-facing
  getHitbox(stateStr) {
    const bs  = FIGHTER_BLOCK_SIZE;
    const def = (stateStr === PUNCH || stateStr === JUMP_PUNCH) ? PUNCH_HITBOX : KICK_HITBOX;
    const sw  = this.width; // sprite width in grid-units (50)
    const ox  = this.facingRight ? def.xOffset : sw - def.xOffset - def.width;
    return {
      x: this.x * bs + ox * bs,
      y: this.y * bs + def.yOffset * bs,
      w: def.width * bs,
      h: def.height * bs,
    };
  }

  // Returns body hurtbox in canvas pixels; smaller when crouching
  getHurtbox() {
    const bs         = FIGHTER_BLOCK_SIZE;
    const crouching  = this.currentState.state === CROUCH;
    const yOff       = crouching ? 20 : HURTBOX.yOffset;
    const h          = crouching ? 30 : HURTBOX.height;
    return {
      x: this.x * bs + HURTBOX.xOffset * bs,
      y: this.y * bs + yOff * bs,
      w: HURTBOX.width * bs,
      h: h * bs,
    };
  }

  update(platforms = PLATFORMS) {
    // Action states self-manage duration
    if (this.currentState.update) this.currentState.update();

    // Horizontal movement
    const vx = this.currentState.getVx?.() ?? 0;
    if (vx !== 0) this.facingRight = vx > 0;
    const maxX = CANVAS_WIDTH / FIGHTER_BLOCK_SIZE - this.width;
    this.x = Math.max(0, Math.min(maxX, this.x + vx));

    // Gravity
    if (!this.isOnGround) this.vy += GRAVITY;
    this.y += this.vy;

    // Ground
    if (this.y >= GROUND_Y) {
      this.y = GROUND_Y;
      this.vy = 0;
      this.isOnGround = true;
      if (this.currentState.state === JUMP) this.enterState(IDLE);
    } else {
      this.isOnGround = false;
      // Platform landing (falling only)
      if (this.vy >= 0) {
        for (const p of platforms) {
          const feetY = this.y + this.height;
          if (feetY >= p.y && feetY <= p.y + PLATFORM_SNAP
              && this.x + this.width > p.x && this.x < p.x + p.width) {
            this.y         = p.y - this.height;
            this.vy        = 0;
            this.isOnGround = true;
            if (this.currentState.state === JUMP) this.enterState(IDLE);
            break;
          }
        }
      }
    }

    // Knockback
    if (this._knockbackTicks > 0) {
      const maxX = CANVAS_WIDTH / FIGHTER_BLOCK_SIZE - this.width;
      this.x = Math.max(0, Math.min(maxX, this.x + this._knockbackVx));
      this._knockbackTicks--;
    }

    if (this._hitCooldown > 0) this._hitCooldown--;
    this._fatigueTimer.update();
    if (this._fatigued) this._fatigueAnimTick++;
    if (this._spreeWindow > 0) {
      this._spreeWindow--;
      if (this._spreeWindow === 0) this._attackSpree = 0;
    }
    this.currentState.nextFrame();
  }

  jump() {
    if (!this.isOnGround) return;
    this.isOnGround = false;
    this.vy = JUMP_FORCE;
    this.enterState(JUMP);
  }

  draw(ctx) {
    const bs = FIGHTER_BLOCK_SIZE;
    let image = this.currentState.getImage();
    image = colorizeFrame(image, this._palette);
    if (!this.facingRight) {
      image = image.map(row => [...row].reverse());
    }
    drawShape(ctx, bs, image, this.x * bs, this.y * bs);
  }
}

export default Fighter;
