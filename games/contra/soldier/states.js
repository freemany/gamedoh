import { State, Image } from '../gamedoh-engine.js';
import { SOLDIER_WALK, SOLDIER_STAND } from './images.js';

export const WALKING  = 'WALKING';
export const STANDING = 'STANDING';
export const DEAD     = 'DEAD';

export class WalkingState extends State {
  constructor(entity) {
    super(entity, WALKING);
    this.image  = new Image([SOLDIER_WALK, SOLDIER_STAND]);
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

export class StandingState extends State {
  constructor(entity) {
    super(entity, STANDING);
    this.image = new Image([SOLDIER_STAND]);
  }
  enter()     { this.image.index = 0; }
  getImage()  { return this.image.getImage(); }
  nextFrame() {}
}

export class DeadState extends State {
  constructor(entity) {
    super(entity, DEAD);
    this.image = new Image([SOLDIER_STAND]);
  }
  enter()     { this.image.index = 0; }
  getImage()  { return this.image.getImage(); }
  nextFrame() {}
}
