import { State, Image } from '../gamedoh-engine.js';
import { DOODLE_STAND, DOODLE_JUMP } from './images.js';

export const FALLING = 'FALLING';
export const JUMPING = 'JUMPING';

export class FallingState extends State {
  constructor(entity) {
    super(entity, FALLING);
    this.image = new Image([DOODLE_STAND]);
  }

  enter()     { this.image.index = 0; }
  getImage()  { return this.image.getImage(); }
  nextFrame() {}
}

export class JumpingState extends State {
  constructor(entity) {
    super(entity, JUMPING);
    this.image = new Image([DOODLE_JUMP]);
  }

  enter()     { this.image.index = 0; }
  getImage()  { return this.image.getImage(); }
  nextFrame() {}
}
