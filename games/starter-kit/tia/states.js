import { State, Image } from '../gamedoh-engine.js';
import { idle, leftWalk, rightWalk, jumpStart, jumpUp } from './images.js';
import { CANVAS_WIDTH, BLOCK_SIZE, JUMPING_HEIGHT, JUMPING_MAX_STEP } from '../constants.js';

export const IDLE = 'IDLE';
export const MOVING_LEFT = 'MOVING_LEFT';
export const MOVING_RIGHT = 'MOVING_RIGHT';
export const JUMPING = 'JUMPING';

export class IdleState extends State {
  constructor(tia) {
    super(tia, IDLE);
    this.image = new Image([idle]);
    this._timer = 0;
  }

  enter() {
    this.image.index = 0;
    this._timer = 0;
  }

  getImage() {
    return this.image.getImage();
  }

  nextFrame() {
    this._timer++;
  }
}

export class MovingLeftState extends State {
  constructor(tia) {
    super(tia, MOVING_LEFT);
    this.image = new Image([idle, leftWalk]);
    this._timer = 0;
  }

  enter() {
    this.image.index = 0;
    this._timer = 0;
  }

  getImage() {
    return this.image.getImage();
  }

  nextFrame() {
    if (this.entity.x > 0) this.entity.x--;
    if (++this._timer >= 6) {
      this._timer = 0;
      this.image.next();
    }
  }
}

export class MovingRightState extends State {
  constructor(tia) {
    super(tia, MOVING_RIGHT);
    this.image = new Image([idle, rightWalk]);
    this._timer = 0;
  }

  enter() {
    this.image.index = 0;
    this._timer = 0;
  }

  getImage() {
    return this.image.getImage();
  }

  nextFrame() {
    const maxX = Math.floor(CANVAS_WIDTH / BLOCK_SIZE) - this.entity.width;
    if (this.entity.x < maxX) this.entity.x++;
    if (++this._timer >= 6) {
      this._timer = 0;
      this.image.next();
    }
  }
}

export class JumpingState extends State {
  constructor(tia) {
    super(tia, JUMPING);
    this.image = new Image([jumpStart, jumpUp]);
    this._step = 0;
  }

  enter() {
    this._step = 0;
    this.image.index = 0;
    this.entity.y -= JUMPING_HEIGHT;
  }

  getImage() {
    return this.image.getImage();
  }

  nextFrame() {
    this._step++;
    if (this._step === 1) {
      this.image.index = 1; // peak frame
    }
    if (this._step >= JUMPING_MAX_STEP) {
      this.entity.y += JUMPING_HEIGHT;
      this.entity.enterState(IDLE);
    }
  }
}
