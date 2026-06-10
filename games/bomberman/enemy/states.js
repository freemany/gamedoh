import { State, Image } from '../gamedoh-engine.js';
import { deadBurst1, deadBurst2 } from './images.js';

export const WALKING = 'WALKING';
export const DEAD    = 'DEAD';

export class WalkingState extends State {
  constructor(entity, frames) {
    super(entity, WALKING);
    this.image = new Image(frames);
    this._timer = 0;
  }

  enter()    { this.image.index = 0; this._timer = 0; }
  getImage() { return this.image.getImage(); }

  nextFrame() {
    if (++this._timer >= 6) {
      this._timer = 0;
      this.image.next();
    }
  }
}

export class DeadState extends State {
  constructor(entity) {
    super(entity, DEAD);
    this.image = new Image([deadBurst1, deadBurst2]);
    this._timer = 0;
    this._done = false;
  }

  enter() {
    this.image.index = 0;
    this._timer = 0;
    this._done = false;
  }

  getImage() { return this.image.getImage(); }

  nextFrame() {
    if (this._done) return;
    this._timer++;
    if (this._timer % 3 === 0) this.image.next();
    if (this._timer >= 30) {
      this._done = true;
      this.entity.alive = false;
    }
  }
}
