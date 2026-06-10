import { Flash, drawShape } from '../gamedoh-engine.js';
import {
  TILE_SIZE,
  GRID_OFFSET_Y,
  BLOCK_SIZE,
  PLAYER_SPEED,
  PLAYER_MARGIN,
  SNAP_TOLERANCE,
  DEFAULT_MAX_BOMBS,
  DEFAULT_FIRE_POWER,
  TILE_HARD,
  TILE_SOFT,
  EXIT_SCORE,
} from '../constants.js';
import Bomb from '../bomb.js';
import { playSound } from '../sounds.js';
import { IDLE, WALKING, DEAD, IdleState, WalkingState, DeadState } from './states.js';

class Player {
  constructor(game, col, row) {
    this.game = game;
    this.x = game.gridOffsetX + col * TILE_SIZE;
    this.y = GRID_OFFSET_Y + row * TILE_SIZE;
    this.col = col;
    this.row = row;
    this.width = TILE_SIZE;
    this.height = TILE_SIZE;
    this.alive = true;

    this.maxBombs = DEFAULT_MAX_BOMBS;
    this.bombsPlaced = 0;
    this.firePower = DEFAULT_FIRE_POWER;
    this.remote = false;
    this.pierce = false;

    this.flash = new Flash(6);
    this._ownBomb = null; // bomb placed while standing on this tile — passable until clear

    // State machine
    this.states = {
      [IDLE]:    new IdleState(this),
      [WALKING]: new WalkingState(this),
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

  update(keys) {
    // Advance animation / death timer
    this.currentState.nextFrame();

    // Block input while dead
    if (this.currentState.state === DEAD) return;

    // Determine movement direction
    let dx = 0, dy = 0;
    if (keys['ArrowLeft'])       dx = -1;
    else if (keys['ArrowRight']) dx =  1;
    else if (keys['ArrowUp'])    dy = -1;
    else if (keys['ArrowDown'])  dy =  1;

    const moving = dx !== 0 || dy !== 0;

    // Clear own-bomb reference once the player's bounding box is fully off it
    if (this._ownBomb) {
      if (!this._ownBomb.alive) {
        this._ownBomb = null;
      } else {
        const m = PLAYER_MARGIN;
        const bx = this._ownBomb.x;
        const by = this._ownBomb.y;
        const overlapX = this.x + m < bx + TILE_SIZE && this.x + TILE_SIZE - m > bx;
        const overlapY = this.y + m < by + TILE_SIZE && this.y + TILE_SIZE - m > by;
        if (!overlapX || !overlapY) this._ownBomb = null;
      }
    }

    // Snap perpendicular axis toward tile centre for clean corridor traversal
    if (dx !== 0) {
      const targetY = GRID_OFFSET_Y + Math.round((this.y - GRID_OFFSET_Y) / TILE_SIZE) * TILE_SIZE;
      const diff = targetY - this.y;
      if (Math.abs(diff) <= SNAP_TOLERANCE) {
        this.y = targetY;
      } else {
        this.y += Math.sign(diff) * Math.min(PLAYER_SPEED, Math.abs(diff));
      }
    }
    if (dy !== 0) {
      const targetX = this.game.gridOffsetX + Math.round((this.x - this.game.gridOffsetX) / TILE_SIZE) * TILE_SIZE;
      const diff = targetX - this.x;
      if (Math.abs(diff) <= SNAP_TOLERANCE) {
        this.x = targetX;
      } else {
        this.x += Math.sign(diff) * Math.min(PLAYER_SPEED, Math.abs(diff));
      }
    }

    // Attempt movement
    if (moving) {
      const newX = this.x + dx * PLAYER_SPEED;
      const newY = this.y + dy * PLAYER_SPEED;
      if (this._canMoveTo(newX, newY)) {
        this.x = newX;
        this.y = newY;
      }
    }

    // Update grid tile coordinate
    this.col = Math.max(0, Math.min(this.game.cols - 1, Math.round((this.x - this.game.gridOffsetX) / TILE_SIZE)));
    this.row = Math.max(0, Math.min(this.game.rows - 1, Math.round((this.y - GRID_OFFSET_Y) / TILE_SIZE)));

    // Switch walking / idle state
    this.enterState(moving ? WALKING : IDLE);

    // Flash invincibility tick
    this.flash.update();

    // Danger checks — only when not invincible
    if (!this.flash.active) {
      // Caught in a flame
      if (this.game.flames.some(f => f.col === this.col && f.row === this.row)) {
        this.die();
        return;
      }
      // Touched an enemy
      for (const e of this.game.enemies) {
        if (e.currentState?.state === DEAD) continue; // ignore dying enemies
        const ex = e.x + TILE_SIZE / 2;
        const ey = e.y + TILE_SIZE / 2;
        const px = this.x + TILE_SIZE / 2;
        const py = this.y + TILE_SIZE / 2;
        if (Math.abs(ex - px) < TILE_SIZE * 0.5 && Math.abs(ey - py) < TILE_SIZE * 0.5) {
          this.die();
          return;
        }
      }
    }

    // Item collection
    for (const item of this.game.items) {
      if (item.alive && item.col === this.col && item.row === this.row) {
        item.collect(this);
      }
    }

    // Exit check — player must hold the key and step onto exit tile
    if (
      this.game.hasKey &&
      this.game.exitVisible &&
      this.col === this.game.exitCol &&
      this.row === this.game.exitRow &&
      !this.game._advancingLevel
    ) {
      this.game._advancingLevel = true;
      this.game.addScore(EXIT_SCORE);
      this.game._timer?.cancel();
      playSound('exit');
      this.game.level.advance();
    }
  }

  _canMoveTo(newX, newY) {
    const m = PLAYER_MARGIN;
    const pts = [
      [newX + m,                newY + m],
      [newX + TILE_SIZE - m - 1, newY + m],
      [newX + m,                newY + TILE_SIZE - m - 1],
      [newX + TILE_SIZE - m - 1, newY + TILE_SIZE - m - 1],
    ];
    for (const [px, py] of pts) {
      const c = Math.floor((px - this.game.gridOffsetX) / TILE_SIZE);
      const r = Math.floor((py - GRID_OFFSET_Y) / TILE_SIZE);
      if (c < 0 || c >= this.game.cols || r < 0 || r >= this.game.rows) return false;
      const tile = this.game.grid[r]?.[c];
      if (tile === TILE_HARD || tile === TILE_SOFT) return false;
      // Skip the bomb the player just placed — passable until they walk clear of it
      if (this.game.bombs.some(b => b.col === c && b.row === r && b !== this._ownBomb)) return false;
    }
    return true;
  }

  placeBomb() {
    if (this.bombsPlaced >= this.maxBombs) return;
    if (this.game.bombs.some(b => b.col === this.col && b.row === this.row)) return;

    const bomb = new Bomb(this.game, this.col, this.row, this.firePower, this);
    bomb.isRemote = this.remote;
    bomb.pierce = this.pierce;
    this.game.bombs.push(bomb);
    this.bombsPlaced++;
    this._ownBomb = bomb; // passable until player walks clear
    playSound('bomb_place');
  }

  detonateRemote() {
    this.game.bombs.filter(b => b.isRemote && b.alive).forEach(b => b.explode());
  }

  die() {
    if (this.flash.active) return;
    if (this.currentState.state === DEAD) return;
    this.game.shake.trigger();
    this.game._timer?.cancel();
    playSound('death');
    this.enterState(DEAD); // DeadState.nextFrame() will call game.loseLife() after animation
  }

  draw(ctx) {
    if (!this.flash.visible) return;
    ctx.save();
    const sprite = this.currentState.getImage();
    const spriteW = sprite[0].length * BLOCK_SIZE;
    const spriteH = sprite.length * BLOCK_SIZE;
    const ox = this.x + (TILE_SIZE - spriteW) / 2;
    const oy = this.y + (TILE_SIZE - spriteH) / 2;
    drawShape(ctx, BLOCK_SIZE, sprite, ox, oy);
    ctx.restore();
  }
}

export default Player;
