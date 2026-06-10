import { State, Image } from '../gamedoh-engine.js';
import { fighterFrame1, fighterFrame2, fighterExplode1, fighterExplode2, fighterExplode3 } from './images.js';

export const IDLE   = 'IDLE';
export const MOVING = 'MOVING';
export const DEAD   = 'DEAD';

export class IdleState extends State {
  constructor(entity) {
    super(entity, IDLE);
    this.image = new Image([fighterFrame1]);
  }
  enter()    { this.image.index = 0; }
  getImage() { return this.image.getImage(); }
  nextFrame() {}
}

export class MovingState extends State {
  constructor(entity) {
    super(entity, MOVING);
    this.image = new Image([fighterFrame1, fighterFrame2]);
    this._timer = 0;
  }
  enter()    { this.image.index = 0; this._timer = 0; }
  getImage() { return this.image.getImage(); }
  nextFrame() {
    if (++this._timer >= 6) { this._timer = 0; this.image.next(); }
  }
}

export class DeadState extends State {
  constructor(entity) {
    super(entity, DEAD);
    this.image = new Image([fighterExplode1, fighterExplode2, fighterExplode3]);
    this._timer = 0;
    this._done  = false;
  }
  enter() { this.image.index = 0; this._timer = 0; this._done = false; }
  getImage() { return this.image.getImage(); }
  nextFrame() {
    if (this._done) return;
    this._timer++;
    if (this._timer % 5 === 0) this.image.next();
    if (this._timer >= 24) {
      this._done = true;
      this.entity.alive = false;
      this.entity.game.loseLife();
    }
  }
}
