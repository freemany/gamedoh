import { drawShape, Flash } from '../gamedoh-engine.js';
import {
  BLOCK_SIZE, CANVAS_WIDTH, PLAYER_Y, PLAYER_SPEED,
  FIGHTER_W, FIGHTER_H,
  MAX_PLAYER_BULLETS, PLAYER_BULLET_SPEED,
} from '../constants.js';
import { IDLE, MOVING, DEAD, IdleState, MovingState, DeadState } from './states.js';
import Bullet from '../bullet.js';
import { playSound } from '../sounds.js';

class Fighter {
  constructor(game) {
    this.game   = game;
    this.x      = CANVAS_WIDTH / 2 - FIGHTER_W / 2;
    this.y      = PLAYER_Y;
    this.width  = FIGHTER_W;
    this.height = FIGHTER_H;
    this.alive  = true;
    this.dual   = false;
    this.flash  = new Flash(6);
    this.bullets = [];

    this.states = {
      [IDLE]:   new IdleState(this),
      [MOVING]: new MovingState(this),
      [DEAD]:   new DeadState(this),
    };
    this.currentState = this.states[IDLE];
    this.currentState.enter();
  }

  get state() { return this.currentState.state; }

  enterState(name) {
    if (this.currentState.state === name) return;
    if (!this.states[name]) return;
    this.currentState = this.states[name];
    this.currentState.enter();
  }

  move(dx) {
    if (this.state === DEAD) return;
    const newX = this.x + dx * PLAYER_SPEED;
    const minX = 0;
    const maxX = CANVAS_WIDTH - FIGHTER_W;
    this.x = Math.max(minX, Math.min(maxX, newX));
    this.enterState(MOVING);
  }

  stopMoving() {
    if (this.state === MOVING) this.enterState(IDLE);
  }

  shoot() {
    if (this.state === DEAD) return;
    const active = this.bullets.filter(b => b.alive).length;
    if (active >= MAX_PLAYER_BULLETS) return;
    const cx = this.x + FIGHTER_W / 2;
    if (this.dual) {
      this.bullets.push(new Bullet(this.game, cx - 14, this.y, -PLAYER_BULLET_SPEED, 'player'));
      this.bullets.push(new Bullet(this.game, cx + 14, this.y, -PLAYER_BULLET_SPEED, 'player'));
    } else {
      this.bullets.push(new Bullet(this.game, cx, this.y, -PLAYER_BULLET_SPEED, 'player'));
    }
    playSound('shoot');
  }

  die() {
    if (this.state === DEAD || this.flash.active) return;
    playSound('explode_player');
    if (this.game.shake) this.game.shake.trigger();
    this.enterState(DEAD);
  }

  update() {
    this.flash.update();
    this.bullets = this.bullets.filter(b => b.alive);
    this.bullets.forEach(b => b.update());
    this.currentState.nextFrame();
  }

  draw(ctx) {
    if (!this.flash.visible) return;
    const sprite = this.currentState.getImage();
    if (!sprite) return;
    ctx.save();
    if (this.dual) {
      drawShape(ctx, BLOCK_SIZE, sprite, Math.floor(this.x - 14), this.y);
      drawShape(ctx, BLOCK_SIZE, sprite, Math.floor(this.x + 14), this.y);
    } else {
      drawShape(ctx, BLOCK_SIZE, sprite, Math.floor(this.x), this.y);
    }
    ctx.restore();
    // Draw bullets
    this.bullets.forEach(b => b.draw(ctx));
  }
}

export default Fighter;
