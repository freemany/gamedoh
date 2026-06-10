import { drawShape } from '../gamedoh-engine.js';
import {
  TILE_SIZE, BLOCK_SIZE, GRID_OFFSET_Y,
  TILE_HARD, TILE_SOFT,
  WANDERER_SPEED, HUNTER_SPEED, GHOST_SPEED, RUNNER_SPEED,
} from '../constants.js';
import { WALKING, DEAD, WalkingState, DeadState } from './states.js';
import {
  wandererWalk1, wandererWalk2,
  hunterWalk1, hunterWalk2,
  ghostWalk1, ghostWalk2,
  runnerWalk1, runnerWalk2,
} from './images.js';

// ── BaseEnemy ─────────────────────────────────────────────────────────────────

class BaseEnemy {
  constructor(game, col, row, speed, walkFrames) {
    this.game = game;
    this.col = col;
    this.row = row;
    this.x = game.gridOffsetX + col * TILE_SIZE;
    this.y = GRID_OFFSET_Y + row * TILE_SIZE;
    this.width = TILE_SIZE;
    this.height = TILE_SIZE;
    this.alive = true;
    this.speed = speed;

    this._targetCol = col;
    this._targetRow = row;
    this._lastDir = null; // { dc, dr }

    // State machine
    this.states = {
      [WALKING]: new WalkingState(this, walkFrames),
      [DEAD]:    new DeadState(this),
    };
    this.currentState = this.states[WALKING];
    this.currentState.enter();
  }

  enterState(name) {
    if (this.currentState.state === name) return;
    this.currentState = this.states[name];
    this.currentState.enter();
  }

  // Returns true if the cell (c, r) is passable for this enemy type
  _canEnter(c, r, canEnterSoft = false) {
    if (c < 0 || c >= this.game.cols || r < 0 || r >= this.game.rows) return false;
    const tile = this.game.grid[r]?.[c];
    if (tile === TILE_HARD) return false;
    if (tile === TILE_SOFT && !canEnterSoft) return false;
    return true;
  }

  // Valid cardinal directions from current target tile
  _validDirs(canEnterSoft = false) {
    const dirs = [
      { dc: 1, dr: 0 }, { dc: -1, dr: 0 },
      { dc: 0, dr: 1 }, { dc: 0, dr: -1 },
    ];
    return dirs.filter(({ dc, dr }) =>
      this._canEnter(this._targetCol + dc, this._targetRow + dr, canEnterSoft)
    );
  }

  // Choose next tile — override in subclasses
  _chooseNext() {
    const dirs = this._validDirs();
    if (dirs.length === 0) return;
    // Don't reverse unless it's the only option
    const noReverse = dirs.filter(d =>
      !(this._lastDir && d.dc === -this._lastDir.dc && d.dr === -this._lastDir.dr)
    );
    const choices = noReverse.length > 0 ? noReverse : dirs;
    const dir = choices[Math.floor(Math.random() * choices.length)];
    this._lastDir = dir;
    this._targetCol += dir.dc;
    this._targetRow += dir.dr;
  }

  die() {
    if (this.currentState.state === DEAD) return;
    this.enterState(DEAD);
  }

  update() {
    this.currentState.nextFrame();
    if (!this.alive) return;

    const targetX = this.game.gridOffsetX + this._targetCol * TILE_SIZE;
    const targetY = GRID_OFFSET_Y + this._targetRow * TILE_SIZE;

    const dx = targetX - this.x;
    const dy = targetY - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist <= this.speed) {
      // Snap to target tile and pick next
      this.x = targetX;
      this.y = targetY;
      this.col = this._targetCol;
      this.row = this._targetRow;
      this._chooseNext();
    } else {
      this.x += (dx / dist) * this.speed;
      this.y += (dy / dist) * this.speed;
      // Update logical col/row to current pixel position
      this.col = Math.round((this.x - this.game.gridOffsetX) / TILE_SIZE);
      this.row = Math.round((this.y - GRID_OFFSET_Y) / TILE_SIZE);
    }
  }

  draw(ctx) {
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

// ── Wanderer (red) — random walk, no reversals ────────────────────────────────

class Wanderer extends BaseEnemy {
  constructor(game, col, row) {
    super(game, col, row, WANDERER_SPEED, [wandererWalk1, wandererWalk2]);
  }
  // Uses default _chooseNext (random, no reverse)
}

// ── Hunter (orange) — chases player on same row/col, else wanders ─────────────

class Hunter extends BaseEnemy {
  constructor(game, col, row) {
    super(game, col, row, HUNTER_SPEED, [hunterWalk1, hunterWalk2]);
  }

  _chooseNext() {
    const player = this.game.player;
    if (player && player.currentState?.state !== DEAD) {
      const pc = player.col;
      const pr = player.row;

      // Try line-of-sight along same row
      if (pr === this._targetRow) {
        const dc = Math.sign(pc - this._targetCol);
        if (dc !== 0 && this._canEnter(this._targetCol + dc, this._targetRow)) {
          this._lastDir = { dc, dr: 0 };
          this._targetCol += dc;
          return;
        }
      }
      // Try line-of-sight along same col
      if (pc === this._targetCol) {
        const dr = Math.sign(pr - this._targetRow);
        if (dr !== 0 && this._canEnter(this._targetCol, this._targetRow + dr)) {
          this._lastDir = { dc: 0, dr };
          this._targetRow += dr;
          return;
        }
      }
    }
    // Fall back to random walk
    super._chooseNext();
  }
}

// ── Ghost (purple) — random walk, can pass through soft blocks ────────────────

class Ghost extends BaseEnemy {
  constructor(game, col, row) {
    super(game, col, row, GHOST_SPEED, [ghostWalk1, ghostWalk2]);
  }

  _validDirs() {
    return super._validDirs(true); // canEnterSoft = true
  }
}

// ── Runner (green) — flees nearest bomb, else wanders ────────────────────────

class Runner extends BaseEnemy {
  constructor(game, col, row) {
    super(game, col, row, RUNNER_SPEED, [runnerWalk1, runnerWalk2]);
  }

  _chooseNext() {
    const bombs = this.game.bombs.filter(b => b.alive);
    if (bombs.length === 0) {
      super._chooseNext();
      return;
    }

    // Find nearest bomb
    let nearest = bombs[0];
    let minDist = Infinity;
    for (const b of bombs) {
      const d = Math.abs(b.col - this._targetCol) + Math.abs(b.row - this._targetRow);
      if (d < minDist) { minDist = d; nearest = b; }
    }

    // Move in direction that maximises distance from nearest bomb
    const dirs = this._validDirs();
    if (dirs.length === 0) return;

    let bestDir = null;
    let bestDist = -1;
    for (const { dc, dr } of dirs) {
      const nc = this._targetCol + dc;
      const nr = this._targetRow + dr;
      const d = Math.abs(nearest.col - nc) + Math.abs(nearest.row - nr);
      if (d > bestDist) { bestDist = d; bestDir = { dc, dr }; }
    }

    if (bestDir) {
      this._lastDir = bestDir;
      this._targetCol += bestDir.dc;
      this._targetRow += bestDir.dr;
    }
  }
}

// ── Factory ───────────────────────────────────────────────────────────────────

export const createEnemy = (type, game, col, row) => {
  switch (type) {
    case 'wanderer': return new Wanderer(game, col, row);
    case 'hunter':   return new Hunter(game, col, row);
    case 'ghost':    return new Ghost(game, col, row);
    case 'runner':   return new Runner(game, col, row);
    default: throw new Error(`Unknown enemy type: ${type}`);
  }
};
