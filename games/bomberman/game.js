import { BaseGame, LevelIntro, Countdown } from './gamedoh-engine.js';
import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  BLOCK_SIZE,
  HEART_BEAT,
  LIVES,
  INVINCIBLE_FRAMES,
  ENEMY_SCORE,
  ITEM_EXIT,
} from './constants.js';
import Level from './level.js';
import Item from './item.js';
import { drawStartScreen, drawPauseOverlay, drawGameOverScreen, drawWinScreen, drawWorld, drawHUD } from './screens.js';

class Game extends BaseGame {
  constructor(ctx, opts) {
    super(ctx, opts, {
      canvasWidth: CANVAS_WIDTH,
      canvasHeight: CANVAS_HEIGHT,
      blockSize: BLOCK_SIZE,
      heartbeat: HEART_BEAT,
      lives: LIVES,
      initialSpeed: 1,
      maxSpeed: 1,
      speedUpEvery: 9999,
    });

    this.level = new Level(this);

    // State flags
    this._transitioning = false;
    this._pendingLevelStart = false;
    this._advancingLevel = false;
    this._timerMs = 0; // milliseconds remaining — decremented by HEART_BEAT each active frame

    // Entities
    this.player = null;
    this.enemies = [];
    this.bombs = [];
    this.flames = [];
    this.items = [];

    // Map state
    this.grid = [];
    this.cols = 15;
    this.rows = 13;
    this.gridOffsetX = 0;
    this.hiddenItems = new Map();
    this.hasKey = false;
    this.exitCol = -1;
    this.exitRow = -1;
    this.exitVisible = false;
    this._keyMessageTimer = 0; // frames to show "KEY GET!" banner
  }

  _update() {
    if (this._transitioning) return;

    if (this._pendingLevelStart) {
      this._pendingLevelStart = false;
      this._startLevel();
      return;
    }

    // Count down level timer
    this._timerMs -= HEART_BEAT;
    if (this._timerMs <= 0) {
      this._timerMs = 0;
      this.player?.die();
      return;
    }

    // Entity updates
    if (this.player) this.player.update(this._keys);
    this.enemies.forEach(e => e.update());
    this.bombs.forEach(b => b.update());
    this.flames.forEach(f => f.update());
    this.items.forEach(i => i.update());

    // Trigger death animation for enemies hit by flame
    for (const e of this.enemies) {
      if (e.currentState?.state !== 'DEAD' &&
          this.flames.some(f => f.col === e.col && f.row === e.row)) {
        e.die();
        this.addScore(ENEMY_SCORE);
      }
    }
    // Remove enemies whose death animation has finished (alive set false by DeadState)
    this.enemies = this.enemies.filter(e => e.alive);

    // Prune dead entities
    this.bombs = this.bombs.filter(b => b.alive);
    this.flames = this.flames.filter(f => f.alive);
    this.items = this.items.filter(i => i.alive);
  }

  async _startLevel() {
    this._transitioning = true;
    await new LevelIntro(this, this.level.index + 1).start();
    if (this.level.index > 0) {
      await new Countdown(this, 3).start();
    }
    this._transitioning = false;
  }

  // Called by bomb.js when a soft block is destroyed
  _revealAt(col, row) {
    const type = this.hiddenItems.get(`${col},${row}`);
    if (!type) return;
    this.hiddenItems.delete(`${col},${row}`);

    if (type === ITEM_EXIT) {
      this.exitCol = col;
      this.exitRow = row;
      this.exitVisible = true;
    } else {
      this.items.push(new Item(this, col, row, type));
    }
  }

  loseLife() {
    super.loseLife();

    if (this.lives > 0 && this.player) {
      // Respawn at top-left safe zone
      this.player.x = this.gridOffsetX;
      this.player.y = GRID_OFFSET_Y;
      this.player.col = 0;
      this.player.row = 0;
      this.player.bombsPlaced = 0;
      this.player.enterState('IDLE');
      this.player.flash.trigger(INVINCIBLE_FRAMES);

      // Clear bombs and flames for fairness
      this.bombs = [];
      this.flames = [];
      this._advancingLevel = false;

      // Reset level timer
      this._timerMs = this.level.config.timeLimit * 1000;
    }
  }

  win() {
    super.win();
  }

  _drawWorld() { drawWorld(this); }

  drawHUD() { drawHUD(this); }

  drawStartScreen() {
    drawStartScreen(this.ctx, this.startButton);
  }

  drawPauseOverlay() {
    drawPauseOverlay(this.ctx);
  }

  drawGameOverScreen() {
    drawGameOverScreen(this.ctx, this.score, this.restartButton);
  }

  drawWinScreen() {
    drawWinScreen(this.ctx, this.score, this.restartButton);
  }
}

export default Game;
