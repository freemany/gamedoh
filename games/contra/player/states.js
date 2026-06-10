import { State, Image } from '../gamedoh-engine.js';
import { PLAYER_MAIN, PLAYER_WALK, PLAYER_SHOOT_UP, PLAYER_SQUAT } from './images.js';

export const IDLE      = 'IDLE';
export const RUNNING   = 'RUNNING';
export const JUMPING   = 'JUMPING';
export const SQUAT     = 'SQUAT';
export const SHOOT_UP  = 'SHOOT_UP';
export const DEAD      = 'DEAD';

export class IdleState extends State {
  constructor(entity) {
    super(entity, IDLE);
    this.image = new Image([PLAYER_MAIN]);
  }
  enter()     { this.image.index = 0; }
  getImage()  { return this.image.getImage(); }
  nextFrame() {}
}

export class RunningState extends State {
  constructor(entity) {
    super(entity, RUNNING);
    this.image  = new Image([PLAYER_MAIN, PLAYER_WALK]);
    this._timer = 0;
  }
  enter()    { this.image.index = 0; this._timer = 0; }
  getImage() { return this.image.getImage(); }
  nextFrame() {
    if (++this._timer >= 8) {
      this._timer = 0;
      this.image.next();
    }
  }
}

export class JumpingState extends State {
  constructor(entity) {
    super(entity, JUMPING);
    this.image = new Image([PLAYER_MAIN]);
  }
  enter()     { this.image.index = 0; }
  getImage()  { return this.image.getImage(); }
  nextFrame() {}
}

export class ShootUpState extends State {
  constructor(entity) {
    super(entity, SHOOT_UP);
    this.image = new Image([PLAYER_SHOOT_UP]);
  }
  enter()     { this.image.index = 0; }
  getImage()  { return this.image.getImage(); }
  nextFrame() {}
}

export class SquatState extends State {
  constructor(entity) {
    super(entity, SQUAT);
    this.image = new Image([PLAYER_SQUAT]);
  }
  enter()     { this.image.index = 0; }
  getImage()  { return this.image.getImage(); }
  nextFrame() {}
}

export class DeadState extends State {
  constructor(entity) {
    super(entity, DEAD);
    this.image = new Image([PLAYER_MAIN]);
  }
  enter()     { this.image.index = 0; }
  getImage()  { return this.image.getImage(); }
  nextFrame() {}
}
