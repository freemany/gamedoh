import { drawShape } from '../gamedoh-engine.js';
import { colorizeFrame } from '../spriteUtils.js';
import { playSound } from '../sounds.js';
import {
  FIGHTER_BLOCK_SIZE, CANVAS_WIDTH, GROUND_Y, GRAVITY,
  IDLE, WALK_LEFT, WALK_RIGHT, PUNCH, KICK, STUN, DEAD,
  ATTACK_COOLDOWN_TICKS, ENEMY_ATTACK_RANGE,
  PUNCH_HITBOX, KICK_HITBOX, HURTBOX,
  PUNCH_DAMAGE, KICK_DAMAGE,
  KNOCKBACK_VX, KNOCKBACK_TICKS,
  ENEMY_TYPES,
} from '../constants.js';
import {
  EnemyIdleState, EnemyWalkState,
  EnemyPunchState, EnemyKickState,
  EnemyStunState, EnemyDeadState,
} from './states.js';

class Enemy {
  constructor(game, color = 'r', type = 'grunt') {
    this.game = game;
    const cfg   = game.level.config;
    const stats = ENEMY_TYPES[type] ?? ENEMY_TYPES.grunt;

    // Spawn just off the right edge
    this.x = CANVAS_WIDTH / FIGHTER_BLOCK_SIZE + 5;
    this.y = GROUND_Y;
    this.vy = 0;
    this.isOnGround = true;
    this.facingRight = false;

    this._palette = { w: color };

    // Type-specific scaled stats
    this.label         = stats.label;
    this._speedMult    = stats.speedMult;
    this._damageMult   = stats.damageMult;
    this._cooldownMult = stats.cooldownMult;
    this._attackRange  = stats.attackRange;

    const hp = Math.round(cfg.enemyHp * stats.hpMult);
    this.health    = hp;
    this.maxHealth = hp;
    this._hitCooldown      = 0;
    this._aiAttackCooldown = 0;
    this._knockbackVx      = 0;
    this._knockbackTicks   = 0;
    this.markedForRemoval  = false;

    this.states = {
      [IDLE]:       new EnemyIdleState(this),
      [WALK_LEFT]:  new EnemyWalkState(this, WALK_LEFT),
      [WALK_RIGHT]: new EnemyWalkState(this, WALK_RIGHT),
      [PUNCH]:      new EnemyPunchState(this),
      [KICK]:       new EnemyKickState(this),
      [STUN]:       new EnemyStunState(this),
      [DEAD]:       new EnemyDeadState(this),
    };
    this.currentState = this.states[IDLE];
    this.currentState.enter();
  }

  get width()  { return this.currentState.image.getWidth(); }
  get height() { return this.currentState.image.getHeight(); }

  enterState(name) {
    if (this.currentState?.state === name) return;
    this.currentState = this.states[name];
    this.currentState.enter();
  }

  receiveHit(damage, knockDir = 0) {
    if (this._hitCooldown > 0) return;
    this.health = Math.max(0, this.health - damage);
    this._hitCooldown = ATTACK_COOLDOWN_TICKS;
    this._knockbackVx    = knockDir * KNOCKBACK_VX;
    this._knockbackTicks = KNOCKBACK_TICKS;
    playSound('hit_connect');
    if (this.health <= 0) {
      this.enterState(DEAD);
    } else {
      this.enterState(STUN);
    }
  }

  getHitbox(stateStr) {
    const bs  = FIGHTER_BLOCK_SIZE;
    const def = stateStr === PUNCH ? PUNCH_HITBOX : KICK_HITBOX;
    const sw  = this.width;
    const ox  = this.facingRight ? def.xOffset : sw - def.xOffset - def.width;
    return {
      x: this.x * bs + ox * bs,
      y: this.y * bs + def.yOffset * bs,
      w: def.width * bs,
      h: def.height * bs,
    };
  }

  getHurtbox() {
    const bs = FIGHTER_BLOCK_SIZE;
    return {
      x: this.x * bs + HURTBOX.xOffset * bs,
      y: this.y * bs + HURTBOX.yOffset * bs,
      w: HURTBOX.width * bs,
      h: HURTBOX.height * bs,
    };
  }

  _runAI(player) {
    const s = this.currentState.state;
    // Don't interrupt active states
    if (s === STUN || s === DEAD || s === PUNCH || s === KICK) return;

    const dx    = player.x - this.x;
    const absDx = Math.abs(dx);

    // Always face the player
    this.facingRight = dx > 0;

    const cfg = this.game.level.config;
    if (absDx <= this._attackRange && this._aiAttackCooldown <= 0) {
      this.enterState(Math.random() < 0.5 ? PUNCH : KICK);
      this._aiAttackCooldown = Math.round(cfg.attackCooldown * this._cooldownMult);
    } else {
      this.enterState(dx > 0 ? WALK_RIGHT : WALK_LEFT);
    }
  }

  update(player) {
    if (this.markedForRemoval) return;

    // Self-managing state transitions (stun countdown, attack duration, etc.)
    if (this.currentState.update) this.currentState.update();

    // AI decision
    this._runAI(player);

    // Movement — speed comes from level config; direction from current state
    const s   = this.currentState.state;
    const cfg = this.game.level.config;
    let dx = 0;
    if (s === WALK_LEFT)  dx = -(cfg.enemySpeed * this._speedMult);
    if (s === WALK_RIGHT) dx =  (cfg.enemySpeed * this._speedMult);

    const maxX = CANVAS_WIDTH / FIGHTER_BLOCK_SIZE - this.width;
    this.x = Math.max(0, Math.min(maxX, this.x + dx));

    // Gravity — enemies stay on the ground (no platform jumping)
    if (!this.isOnGround) this.vy += GRAVITY;
    this.y += this.vy;
    if (this.y >= GROUND_Y) {
      this.y = GROUND_Y;
      this.vy = 0;
      this.isOnGround = true;
    }

    // Knockback
    if (this._knockbackTicks > 0) {
      const maxX = CANVAS_WIDTH / FIGHTER_BLOCK_SIZE - this.width;
      this.x = Math.max(0, Math.min(maxX, this.x + this._knockbackVx));
      this._knockbackTicks--;
    }

    if (this._hitCooldown      > 0) this._hitCooldown--;
    if (this._aiAttackCooldown > 0) this._aiAttackCooldown--;

    this.currentState.nextFrame();
  }

  draw(ctx) {
    if (this.markedForRemoval) return;
    const bs = FIGHTER_BLOCK_SIZE;
    let image = this.currentState.getImage();
    image = colorizeFrame(image, this._palette);
    if (!this.facingRight) {
      image = image.map(row => [...row].reverse());
    }
    drawShape(ctx, bs, image, this.x * bs, this.y * bs);
  }
}

export default Enemy;
