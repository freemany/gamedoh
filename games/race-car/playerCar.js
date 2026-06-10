import { State, Image } from './gamedoh-engine.js';
import { drawShape } from './gamedoh-engine.js';
import { playerCar1, playerCar2 } from './images.js';
import {
  LANE_POSITIONS,
  CANVAS_HEIGHT,
  BLOCK_SIZE,
  IDLE,
  MOVING_LEFT,
  MOVING_RIGHT,
} from './constants.js';

class IdleState extends State {
  constructor(car) {
    super(car, IDLE);
    this.image = new Image([playerCar1, playerCar2]);
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
    if (++this._timer >= 8) {
      this._timer = 0;
      this.image.next();
    }
  }
}

class MovingLeftState extends State {
  constructor(car) {
    super(car, MOVING_LEFT);
    this.image = new Image([playerCar1, playerCar2]);
    this._timer = 0;
  }
  enter() {
    this._timer = 0;
  }
  getImage() {
    return this.image.getImage();
  }
  nextFrame() {
    const target = LANE_POSITIONS[this.entity.lane];
    if (this.entity.x > target) {
      this.entity.x = Math.max(this.entity.x - 3, target);
    }
    if (this.entity.x <= target) this.entity.enterState(IDLE);
    if (++this._timer >= 8) {
      this._timer = 0;
      this.image.next();
    }
  }
}

class MovingRightState extends State {
  constructor(car) {
    super(car, MOVING_RIGHT);
    this.image = new Image([playerCar1, playerCar2]);
    this._timer = 0;
  }
  enter() {
    this._timer = 0;
  }
  getImage() {
    return this.image.getImage();
  }
  nextFrame() {
    const target = LANE_POSITIONS[this.entity.lane];
    if (this.entity.x < target) {
      this.entity.x = Math.min(this.entity.x + 3, target);
    }
    if (this.entity.x >= target) this.entity.enterState(IDLE);
    if (++this._timer >= 8) {
      this._timer = 0;
      this.image.next();
    }
  }
}

class PlayerCar {
  constructor(game) {
    this.game = game;
    this.lane = 1; // start center
    this.width = 10; // grid units
    this.height = 12; // grid units
    this.x = LANE_POSITIONS[1];
    this.y = Math.floor(CANVAS_HEIGHT / BLOCK_SIZE) - this.height - 4;
    this.invincible = 0;
    this.states = {
      [IDLE]: new IdleState(this),
      [MOVING_LEFT]: new MovingLeftState(this),
      [MOVING_RIGHT]: new MovingRightState(this),
    };
    this.currentState = this.states[IDLE];
    this.currentState.enter();
  }

  enterState(state) {
    if (this.currentState.state === state) return;
    this.currentState = this.states[state];
    this.currentState.enter();
  }

  move(dir) {
    if (dir === 'left' && this.lane > 0) {
      this.lane--;
      this.enterState(MOVING_LEFT);
    }
    if (dir === 'right' && this.lane < 2) {
      this.lane++;
      this.enterState(MOVING_RIGHT);
    }
  }

  update() {
    if (this.invincible > 0) this.invincible--;
    this.currentState.nextFrame();
    return this;
  }

  draw(ctx) {
    if (this.invincible > 0 && Math.floor(this.invincible / 5) % 2 === 0) return this;
    drawShape(
      ctx,
      this.game.blockSize,
      this.currentState.getImage(),
      this.x * this.game.blockSize,
      this.y * this.game.blockSize
    );
    return this;
  }
}

export default PlayerCar;
