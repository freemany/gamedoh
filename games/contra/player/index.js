import { drawShape, Flash } from '../gamedoh-engine.js';
import {
  BLOCK_SIZE, PLAYER_W, PLAYER_H, GRAVITY, JUMP_VY, MOVE_SPEED,
  SHOOT_COOLDOWN, BULLET_SPEED,
} from '../constants.js';
import Bullet from '../bullet.js';
import { playSound } from '../sounds.js';
import {
  IdleState, RunningState, JumpingState, ShootUpState, SquatState, DeadState,
  IDLE, RUNNING, JUMPING, SHOOT_UP, SQUAT, DEAD,
} from './states.js';

class Player {
  constructor(game, x, y) {
    this.game    = game;
    this.x       = x;
    this.y       = y;
    this.vx      = 0;
    this.vy      = 0;
    this.width   = PLAYER_W;
    this.height  = PLAYER_H;
    this.alive   = true;
    this.facingRight    = true;
    this.onGround       = false;
    this._shootCooldown = 0;
    this._dead          = false;
    this._deadTimer     = 0;
    this.flash = new Flash();

    this.states = {
      [IDLE]:      new IdleState(this),
      [RUNNING]:   new RunningState(this),
      [JUMPING]:   new JumpingState(this),
      [SHOOT_UP]:  new ShootUpState(this),
      [SQUAT]:     new SquatState(this),
      [DEAD]:      new DeadState(this),
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
    if (this._dead) return;
    if (dir === 'left') {
      this.vx = -MOVE_SPEED;
      this.facingRight = false;
      if (this.onGround) this.enterState(RUNNING);
    } else if (dir === 'right') {
      this.vx = MOVE_SPEED;
      this.facingRight = true;
      if (this.onGround) this.enterState(RUNNING);
    } else if (dir === 'jump') {
      if (this.onGround) {
        this.vy = JUMP_VY;
        this.onGround = false;
        this.enterState(JUMPING);
        playSound('jump');
      }
    } else if (dir === 'aimUp') {
      if (this.onGround) this.enterState(SHOOT_UP);
    } else if (dir === 'stopAimUp') {
      if (this.currentState.state === SHOOT_UP) this.enterState(IDLE);
    } else if (dir === 'squat') {
      if (this.onGround) this.enterState(SQUAT);
    } else if (dir === 'unsquat') {
      if (this.currentState.state === SQUAT) this.enterState(IDLE);
    } else if (dir === 'stop') {
      this.vx = 0;
      if (this.onGround && this.currentState.state !== SQUAT && this.currentState.state !== SHOOT_UP) this.enterState(IDLE);
    }
  }

  shoot(bullets) {
    if (this._dead || this._shootCooldown > 0) return;
    this._shootCooldown = SHOOT_COOLDOWN;
    const vx = this.facingRight ? BULLET_SPEED : -BULLET_SPEED;
    const bx = this.facingRight ? this.x + this.width : this.x;
    // Squat gun arm sits lower in the sprite (row 19 vs row 10 when standing)
    const by = this.currentState.state === SQUAT
      ? this.y + Math.floor(this.height * 0.65)
      : this.y + Math.floor(this.height * 0.35);
    bullets.push(new Bullet(bx, by, vx, 0, 'player'));
    playSound('shoot');
  }

  shootUp(bullets) {
    if (this._dead || this._shootCooldown > 0) return;
    this._shootCooldown = SHOOT_COOLDOWN;
    this.enterState(SHOOT_UP);
    bullets.push(new Bullet(this.x + Math.floor(this.width * 0.5), this.y, 0, -BULLET_SPEED, 'player'));
    playSound('shoot');
  }

  die() {
    if (this._dead) return;
    this._dead = true;
    this.vx    = 0;
    this.vy    = -8;
    this.enterState(DEAD);
    playSound('death');
  }

  update(terrain) {
    this.flash.update();
    if (this._shootCooldown > 0) this._shootCooldown--;

    if (this._dead) {
      this.vy += GRAVITY;
      this.y  += this.vy;
      this._deadTimer++;
      if (this._deadTimer > 80) this.game.loseLife();
      return;
    }

    this.vy += GRAVITY;
    this.x  += this.vx;
    this.y  += this.vy;

    // Left world boundary
    if (this.x < 0) this.x = 0;

    this.onGround = false;
    this._resolveTerrain(terrain);

    this.currentState.nextFrame();

    // Right-wall boundary in vertical levels
    if (this.game._isVertical && this.x + this.width > this.game.canvasWidth) {
      this.x = this.game.canvasWidth - this.width;
    }

    // Fall off-screen without terrain → die
    if (!this._dead && this.y > this.game.worldBottom) this.die();
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
        if (this.currentState.state === JUMPING) {
          this.enterState(this.vx !== 0 ? RUNNING : IDLE);
        }
        break;
      }
    }
  }

  draw(ctx, cameraX, cameraY = 0) {
    if (!this.flash.visible) return;
    const sprite = this.currentState.getImage();
    const drawn = this.facingRight
      ? sprite
      : sprite.map(row => [...row].reverse());
    ctx.save();
    drawShape(ctx, BLOCK_SIZE, drawn, this.x - cameraX, this.y - cameraY);
    ctx.restore();
  }
}

export default Player;
