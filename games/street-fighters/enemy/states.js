import { Image } from '../gamedoh-engine.js';
import { playSound } from '../sounds.js';
import {
  FIGHTER_IDLE_1, FIGHTER_WALK_1, FIGHTER_WALK_2,
  FIGHTER_PUNCH, FIGHTER_KICK, FIGHTER_CROUCH,
} from '../fighter/images.js';
import { IDLE, WALK_LEFT, WALK_RIGHT, PUNCH, KICK, STUN, DEAD, STUN_TICKS, POWERUP_DROP_CHANCE } from '../constants.js';

class EnemyState {
  constructor(enemy, state) {
    this.fighter = enemy; // 'fighter' = entity reference, matches engine State convention
    this.state   = state;
  }
  enter()      {}
  getImage()   { return this.image.getImage(); }
  nextFrame()  { this.image.next(); }
  getVx()      { return 0; }
}

export class EnemyIdleState extends EnemyState {
  constructor(enemy) {
    super(enemy, IDLE);
    this.image = new Image([FIGHTER_IDLE_1]);
  }
  enter() { this.image.index = 0; }
}

// Shared walk state used for both WALK_LEFT and WALK_RIGHT
export class EnemyWalkState extends EnemyState {
  constructor(enemy, stateName) {
    super(enemy, stateName);
    this.image  = new Image([FIGHTER_WALK_1, FIGHTER_WALK_2]);
    this._timer = 0;
  }
  enter()  { this._timer = 0; this.image.index = 0; }
  nextFrame() {
    if (++this._timer >= 3) { this._timer = 0; this.image.next(); }
  }
}

export class EnemyPunchState extends EnemyState {
  constructor(enemy) {
    super(enemy, PUNCH);
    this.image  = new Image([FIGHTER_PUNCH]);
    this._ticks = 0;
  }
  enter()  { this._ticks = 0; }
  update() { if (++this._ticks >= 3) this.fighter.enterState(IDLE); }
}

export class EnemyKickState extends EnemyState {
  constructor(enemy) {
    super(enemy, KICK);
    this.image  = new Image([FIGHTER_KICK]);
    this._ticks = 0;
  }
  enter()  { this._ticks = 0; }
  update() { if (++this._ticks >= 3) this.fighter.enterState(IDLE); }
}

export class EnemyStunState extends EnemyState {
  constructor(enemy) {
    super(enemy, STUN);
    this.image  = new Image([FIGHTER_IDLE_1]);
    this._ticks = 0;
  }
  enter() {
    this._ticks = 0;
    playSound('stun');
  }
  update() {
    if (++this._ticks >= STUN_TICKS) this.fighter.enterState(IDLE);
  }
}

export class EnemyDeadState extends EnemyState {
  constructor(enemy) {
    super(enemy, DEAD);
    this.image  = new Image([FIGHTER_CROUCH]);
    this._ticks = 0;
  }
  enter() {
    this._ticks = 0;
    playSound('enemy_die');
    if (Math.random() < POWERUP_DROP_CHANCE) {
      this.fighter.game.spawnPowerup(this.fighter.x);
    }
  }
  update() {
    if (++this._ticks >= 15) this.fighter.markedForRemoval = true;
  }
}
