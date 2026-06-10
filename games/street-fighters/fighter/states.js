import { Image } from '../gamedoh-engine.js';
import { playSound } from '../sounds.js';
import {
  FIGHTER_IDLE_1,
  FIGHTER_WALK_1,
  FIGHTER_WALK_2,
  FIGHTER_PUNCH,
  FIGHTER_KICK,
  FIGHTER_CROUCH,
  FIGHTER_JUMP,
} from './images.js';
import {
  IDLE,
  WALK_LEFT,
  WALK_RIGHT,
  PUNCH,
  KICK,
  CROUCH,
  JUMP,
  JUMP_PUNCH,
  JUMP_KICK,
  FIGHTER_SPEED,
} from '../constants.js';

class State {
  constructor(fighter, state) {
    this.fighter = fighter;
    this.state = state;
  }

  enter() {}
  getImage() {
    return this.image.getImage();
  }
  nextFrame() {
    this.image.next();
  }
  getVx() {
    return 0;
  }
}

export class IdleState extends State {
  constructor(fighter) {
    super(fighter, IDLE);
    this.image = new Image([FIGHTER_IDLE_1]);
  }

  enter() {
    this.image.index = 0;
  }
}

export class WalkLeftState extends State {
  constructor(fighter) {
    super(fighter, WALK_LEFT);
    this.image = new Image([FIGHTER_WALK_1, FIGHTER_WALK_2]);
    this._walkTimer = 0;
  }

  nextFrame() {
    this._walkTimer++;
    if (this._walkTimer >= 3) {
      // step every 3 ticks = 300ms
      this._walkTimer = 0;
      this.image.next();
    }
  }

  getVx() {
    return -FIGHTER_SPEED;
  }
}

export class WalkRightState extends State {
  constructor(fighter) {
    super(fighter, WALK_RIGHT);
    this.image = new Image([FIGHTER_WALK_1, FIGHTER_WALK_2]);
    this._walkTimer = 0;
  }

  nextFrame() {
    this._walkTimer++;
    if (this._walkTimer >= 3) {
      // step every 3 ticks = 300ms
      this._walkTimer = 0;
      this.image.next();
    }
  }

  getVx() {
    return FIGHTER_SPEED;
  }
}

export class PunchState extends State {
  constructor(fighter) {
    super(fighter, PUNCH);
    this.image = new Image([FIGHTER_PUNCH]);
    this._ticks = 0;
  }

  enter() {
    this._ticks = 0;
    playSound('punch_throw');
  }

  update() {
    this._ticks++;
    if (this._ticks >= 3) {
      this.fighter.enterState(IDLE);
    }
  }
}

export class KickState extends State {
  constructor(fighter) {
    super(fighter, KICK);
    this.image = new Image([FIGHTER_KICK]);
    this._ticks = 0;
  }

  enter() {
    this._ticks = 0;
    playSound('kick_throw');
  }

  update() {
    this._ticks++;
    if (this._ticks >= 3) {
      this.fighter.enterState(IDLE);
    }
  }
}

export class JumpPunchState extends State {
  constructor(fighter) {
    super(fighter, JUMP_PUNCH);
    this.image = new Image([FIGHTER_PUNCH]);
    this._ticks = 0;
  }
  enter() {
    this._ticks = 0;
    playSound('punch_throw');
  }
  update() {
    if (++this._ticks >= 4) this.fighter.enterState(JUMP);
  }
}

export class JumpKickState extends State {
  constructor(fighter) {
    super(fighter, JUMP_KICK);
    this.image = new Image([FIGHTER_KICK]);
    this._ticks = 0;
  }
  enter() {
    this._ticks = 0;
    playSound('kick_throw');
  }
  update() {
    if (++this._ticks >= 4) this.fighter.enterState(JUMP);
  }
}

export class CrouchState extends State {
  constructor(fighter) {
    super(fighter, CROUCH);
    this.image = new Image([FIGHTER_CROUCH]);
  }
}

export class JumpState extends State {
  constructor(fighter) {
    super(fighter, JUMP);
    this.image = new Image([FIGHTER_JUMP]);
  }
}
