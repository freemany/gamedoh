import { drawShape, Flash } from '../gamedoh-engine.js';
import { IdleState, RunningState, JumpingState, DeadState, IDLE, RUNNING, JUMPING, DEAD } from './states.js';
import { playSound } from '../sounds.js';
import {
  MARIO_BLOCK_SIZE, GRAVITY, JUMP_VY, MOVE_SPEED,
  MARIO_W, MARIO_H, CANVAS_HEIGHT, CANVAS_WIDTH, WORLD_WIDTH,
} from '../constants.js';

class Mario {
  constructor(game, startX = 64) {
    this.game = game;
    this.x = startX;
    this.y = CANVAS_HEIGHT - 64 - MARIO_H; // standing on ground
    this.vx = 0;
    this.vy = 0;
    this.width = MARIO_W;
    this.height = MARIO_H;
    this.onGround = false;
    this.facingRight = true;
    this._dead = false;
    this.flash = new Flash();    // post-respawn invincibility
    this._lastGroundX = startX; // last x position where Mario stood on solid ground

    this.states = {
      [IDLE]:    new IdleState(this),
      [RUNNING]: new RunningState(this),
      [JUMPING]: new JumpingState(this),
      [DEAD]:    new DeadState(this),
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
    if (dir === 'left')  { this.vx = -MOVE_SPEED; this.facingRight = false; }
    if (dir === 'right') { this.vx = MOVE_SPEED;  this.facingRight = true;  }
    if (dir === 'stop')  { this.vx = 0; }
    if (dir === 'jump' && this.onGround) {
      this.vy = JUMP_VY;
      this.onGround = false;
      playSound('jump');
    }
  }

  die() {
    if (this._dead) return;
    this._dead = true;
    playSound('death');
    this.enterState(DEAD);
  }

  update(tiles, cameraX) {
    this.flash.update();

    if (this._dead) {
      // Dead Mario: only gravity, no tile collision
      this.vy += GRAVITY;
      this.y += this.vy;
      this.currentState.nextFrame();
      return;
    }

    // Gravity
    this.vy += GRAVITY;

    // Move horizontally
    this.x += this.vx;

    // Left boundary — can't scroll back past camera
    if (this.x < cameraX) this.x = cameraX;

    // Horizontal tile collision
    this._resolveTiles(tiles, 'x');

    // Move vertically
    this.onGround = false;
    this.y += this.vy;

    // Vertical tile collision
    this._resolveTiles(tiles, 'y');

    // Right world boundary
    const rightLimit = WORLD_WIDTH - this.width;
    if (this.x > rightLimit) { this.x = rightLimit; this.vx = 0; }

    // Fall into pit
    if (this.y > CANVAS_HEIGHT + 40) {
      this.die();
      return;
    }

    // Track last safe ground position for respawn
    if (this.onGround) this._lastGroundX = this.x;

    // Update animation state
    if (!this.onGround) {
      this.enterState(JUMPING);
    } else if (this.vx !== 0) {
      this.enterState(RUNNING);
    } else {
      this.enterState(IDLE);
    }

    this.currentState.nextFrame();
  }

  _resolveTiles(tiles, axis) {
    tiles.forEach((tile) => {
      if (!this._overlaps(tile)) return;

      if (axis === 'x') {
        if (this.vx > 0) this.x = tile.x - this.width;
        else if (this.vx < 0) this.x = tile.x + tile.w;
        this.vx = 0;
      } else {
        if (this.vy > 0) {
          // Landing on top
          this.y = tile.y - this.height;
          this.vy = 0;
          this.onGround = true;
        } else if (this.vy < 0) {
          // Hitting ceiling
          this.y = tile.y + tile.h;
          this.vy = 0;
        }
      }
    });
  }

  _overlaps(tile) {
    return (
      this.x < tile.x + tile.w &&
      this.x + this.width > tile.x &&
      this.y < tile.y + tile.h &&
      this.y + this.height > tile.y
    );
  }

  draw(ctx, cameraX) {
    if (!this.flash.visible) return;

    const sprite = this.currentState.getImage();
    const screenX = this.x - cameraX;
    const screenY = this.y;

    if (!this.facingRight) {
      // Mirror horizontally
      ctx.save();
      ctx.translate(screenX + this.width, screenY);
      ctx.scale(-1, 1);
      drawShape(ctx, MARIO_BLOCK_SIZE, sprite, 0, 0);
      ctx.restore();
    } else {
      drawShape(ctx, MARIO_BLOCK_SIZE, sprite, screenX, screenY);
    }
  }
}

export default Mario;
