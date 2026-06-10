import { drawShape } from '../gamedoh-engine.js';
import {
  BLOCK_SIZE, SOLDIER_W, SOLDIER_H, GRAVITY, SOLDIER_SPEED,
  ENEMY_SHOOT_INTERVAL, ENEMY_SHOOT_RANGE, KILL_SCORE,
} from '../constants.js';
import Bullet from '../bullet.js';
import { playSound } from '../sounds.js';
import { WalkingState, StandingState, DeadState, WALKING, STANDING, DEAD } from './states.js';

class Soldier {
  constructor(game, x, y) {
    this.game    = game;
    this.x       = x;
    this.y       = y;
    this.vx      = 0;
    this.vy      = 0;
    this.width   = SOLDIER_W;
    this.height  = SOLDIER_H;
    this.alive   = true;
    this.onGround    = false;
    this._shootTimer = 0;
    this._deadTimer  = 0;
    this._dead       = false;

    this.states = {
      [WALKING]:  new WalkingState(this),
      [STANDING]: new StandingState(this),
      [DEAD]:     new DeadState(this),
    };
    this.currentState = this.states[WALKING];
    this.currentState.enter();
  }

  enterState(name) {
    if (this.currentState.state === name) return;
    this.currentState = this.states[name];
    this.currentState.enter();
  }

  hit() {
    if (this._dead) return;
    this._dead = true;
    this.vy    = -5;
    this.vx    = 2; // slight kick back to the right
    this.enterState(DEAD);
    this.game.addScore(KILL_SCORE);
    playSound('hit');
  }

  update(player, bullets, terrain) {
    this.currentState.nextFrame();

    if (this._dead) {
      this.vy += GRAVITY;
      this.x  += this.vx;
      this.y  += this.vy;
      this._deadTimer++;
      if (this._deadTimer > 50) this.alive = false;
      return;
    }

    // Walk left toward player, stand if player is out of range
    const dx = Math.abs(this.x - player.x);
    if (dx < ENEMY_SHOOT_RANGE) {
      this.enterState(WALKING);
      this.x -= SOLDIER_SPEED;
    } else {
      this.enterState(STANDING);
    }

    this.vy += GRAVITY;
    this.y  += this.vy;

    // Remove when far off left edge
    if (this.x + this.width < -64) {
      this.alive = false;
      return;
    }

    this.onGround = false;
    this._resolveTerrain(terrain);

    // Shoot at player when close enough
    this._shootTimer++;
    if (this._shootTimer >= ENEMY_SHOOT_INTERVAL && dx < ENEMY_SHOOT_RANGE) {
      this._shootTimer = 0;
      const dir = player.x < this.x ? -1 : 1;
      const bx  = dir > 0 ? this.x + this.width : this.x;
      bullets.push(new Bullet(bx, this.y + Math.floor(this.height * 0.35), dir * 5, 0, 'enemy'));
    }
  }

  _resolveTerrain(terrain) {
    for (const rect of terrain) {
      const prevBottom = this.y + this.height - this.vy;
      if (
        this.x + this.width > rect.x &&
        this.x < rect.x + rect.w &&
        this.y + this.height > rect.y &&
        prevBottom <= rect.y
      ) {
        this.y       = rect.y - this.height;
        this.vy      = 0;
        this.onGround = true;
        break;
      }
    }
  }

  draw(ctx, cameraX, cameraY = 0) {
    const sprite = this.currentState.getImage();
    ctx.save();
    if (this._dead) ctx.globalAlpha = 0.6;
    drawShape(ctx, BLOCK_SIZE, sprite, this.x - cameraX, this.y - cameraY);
    ctx.restore();
  }
}

export default Soldier;
