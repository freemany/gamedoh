import { State, Image } from '../gamedoh-engine.js';
import { idleFrame, walkFrame1, walkFrame2, deadFrame1, deadFrame2 } from './images.js';
import { startWalking, stopWalking } from '../sounds.js';

export const IDLE    = 'IDLE';
export const WALKING = 'WALKING';
export const DEAD    = 'DEAD';

export class IdleState extends State {
  constructor(entity) {
    super(entity, IDLE);
    this.image = new Image([idleFrame]);
  }

  enter()     { this.image.index = 0; stopWalking(); }
  getImage()  { return this.image.getImage(); }
  nextFrame() {} // no animation while idle
}

export class WalkingState extends State {
  constructor(entity) {
    super(entity, WALKING);
    this.image = new Image([walkFrame1, walkFrame2]);
    this._timer = 0;
  }

  enter()    { this.image.index = 0; this._timer = 0; startWalking(); }
  getImage() { return this.image.getImage(); }

  nextFrame() {
    if (++this._timer >= 8) {
      this._timer = 0;
      this.image.next();
    }
  }
}

export class DeadState extends State {
  constructor(entity) {
    super(entity, DEAD);
    this.image = new Image([deadFrame1, deadFrame2]);
    this._timer = 0;
    this._done = false;
  }

  enter() {
    this.image.index = 0;
    this._timer = 0;
    this._done = false;
    stopWalking();
  }

  getImage() { return this.image.getImage(); }

  nextFrame() {
    if (this._done) return;
    this._timer++;

    // Flash between 2 explosion frames rapidly
    if (this._timer % 4 === 0) this.image.next();

    // After 48 frames (~0.8s), trigger the life loss
    if (this._timer === 48) {
      this._done = true;
      this.entity.game.loseLife();
    }
  }
}
