import { State, Image } from '../gamedoh-engine.js';
import { marioIdle, marioWalkA, marioWalkB, marioJump, marioDead } from './images.js';
import { startWalking, stopWalking } from '../sounds.js';

export const IDLE    = 'IDLE';
export const RUNNING = 'RUNNING';
export const JUMPING = 'JUMPING';
export const DEAD    = 'DEAD';

export class IdleState extends State {
  constructor(mario) {
    super(mario, IDLE);
    this.image = new Image([marioIdle]);
  }
  enter() { this.image.index = 0; stopWalking(); }
  getImage() { return this.image.getImage(); }
  nextFrame() {}
}

export class RunningState extends State {
  constructor(mario) {
    super(mario, RUNNING);
    this.image = new Image([marioWalkA, marioWalkB]);
    this._timer = 0;
  }
  enter() { this.image.index = 0; this._timer = 0; startWalking(); }
  getImage() { return this.image.getImage(); }
  nextFrame() {
    if (++this._timer >= 5) {
      this._timer = 0;
      this.image.next();
    }
  }
}

export class JumpingState extends State {
  constructor(mario) {
    super(mario, JUMPING);
    this.image = new Image([marioJump]);
  }
  enter() { this.image.index = 0; stopWalking(); }
  getImage() { return this.image.getImage(); }
  nextFrame() {}
}

export class DeadState extends State {
  constructor(mario) {
    super(mario, DEAD);
    this.image = new Image([marioDead]);
    this._timer = 0;
  }
  enter() {
    this.image.index = 0;
    this._timer = 0;
    this.entity.vy = -8;
    this.entity.vx = 0;
    stopWalking();
  }
  getImage() { return this.image.getImage(); }
  nextFrame() {
    this._timer++;
    if (this._timer > 80) {
      this.entity.game.loseLife();
    }
  }
}
