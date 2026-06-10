import { drawShape, Flash } from '../gamedoh-engine.js';
import { BLOCK_SIZE, PLAYER_W, PLAYER_H, GRAVITY, MOVE_SPEED, CANVAS_WIDTH } from '../constants.js';
import { FallingState, JumpingState, FALLING, JUMPING } from './states.js';

class Player {
  constructor(game, x, y) {
    this.game   = game;
    this.x      = x;
    this.y      = y;
    this.vx     = 0;
    this.vy     = 0;
    this.width  = PLAYER_W;
    this.height = PLAYER_H;
    this.alive  = true;
    this.flash  = new Flash();

    this.states = {
      [FALLING]: new FallingState(this),
      [JUMPING]: new JumpingState(this),
    };
    this.currentState = this.states[FALLING];
    this.currentState.enter();
  }

  enterState(name) {
    if (this.currentState.state === name) return;
    this.currentState = this.states[name];
    this.currentState.enter();
  }

  move(dir) {
    if (dir === 'left')  this.vx = -MOVE_SPEED;
    if (dir === 'right') this.vx =  MOVE_SPEED;
    if (dir === 'stop')  this.vx =  0;
  }

  update() {
    this.flash.update();

    // Apply gravity and velocity
    this.vy += GRAVITY;
    this.y  += this.vy;
    this.x  += this.vx;

    // Wrap around left/right edges
    if (this.x + this.width < 0) this.x = CANVAS_WIDTH;
    if (this.x > CANVAS_WIDTH)   this.x = -this.width;

    // Switch animation state based on direction of travel
    if (this.vy < 0) this.enterState(JUMPING);
    else             this.enterState(FALLING);

    this.currentState.nextFrame();
  }

  draw(ctx) {
    if (!this.flash.visible) return;
    ctx.save();
    drawShape(ctx, BLOCK_SIZE, this.currentState.getImage(), this.x, this.y);
    ctx.restore();
  }
}

export default Player;
