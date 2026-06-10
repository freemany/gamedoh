import { drawShape } from '../gamedoh-engine.js';
import {
  IdleState,
  MovingLeftState,
  MovingRightState,
  JumpingState,
  IDLE,
  MOVING_LEFT,
  MOVING_RIGHT,
  JUMPING,
} from './states.js';
import { playSound } from '../sounds.js';
import { BLOCK_SIZE, TIA_START_X, TIA_START_Y } from '../constants.js';

class Tia {
  constructor(game) {
    this.game = game;
    this.x = TIA_START_X;
    this.y = TIA_START_Y;
    this.width = 30; // grid units (sprite is 30 wide)
    this.height = 30; // grid units (sprite is 30 tall)

    this.states = {
      [IDLE]: new IdleState(this),
      [MOVING_LEFT]: new MovingLeftState(this),
      [MOVING_RIGHT]: new MovingRightState(this),
      [JUMPING]: new JumpingState(this),
    };
    this.currentState = this.states[IDLE];
    this.currentState.enter();
  }

  enterState(name) {
    if (this.currentState.state === name) return;
    this.currentState = this.states[name];
    this.currentState.enter();
  }

  move(dir) {
    if (this.currentState.state === JUMPING) return;
    if (dir === 'left') {
      this.enterState(MOVING_LEFT);
      playSound('left');
    } else if (dir === 'right') {
      this.enterState(MOVING_RIGHT);
      playSound('right');
    } else if (dir === 'up') {
      this.enterState(JUMPING);
      playSound('jump');
    }
  }

  update() {
    this.currentState.nextFrame();
    return this;
  }

  draw(ctx) {
    drawShape(
      ctx,
      BLOCK_SIZE,
      this.currentState.getImage(),
      this.x * BLOCK_SIZE,
      this.y * BLOCK_SIZE
    );
    return this;
  }
}

export default Tia;
