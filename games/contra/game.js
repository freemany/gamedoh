import { BaseGame, isCollision } from './gamedoh-engine.js';
import {
  CANVAS_WIDTH, CANVAS_HEIGHT, BLOCK_SIZE, HEART_BEAT, LIVES,
  INITIAL_SPEED, MAX_SPEED, SPEED_UP_EVERY,
  WORLD_WIDTH, WORLD_HEIGHT, LEVELS_DATA,
} from './constants.js';
import Level from './level.js';
import { drawBackground, drawTerrain, getTerrain } from './terrain.js';
import {
  drawStartScreen, drawPauseOverlay, drawGameOverScreen, drawWinScreen,
} from './screens.js';

class Game extends BaseGame {
  constructor(ctx, opts) {
    super(ctx, opts, {
      canvasWidth:  CANVAS_WIDTH,
      canvasHeight: CANVAS_HEIGHT,
      blockSize:    BLOCK_SIZE,
      heartbeat:    HEART_BEAT,
      lives:        LIVES,
      initialSpeed: INITIAL_SPEED,
      maxSpeed:     MAX_SPEED,
      speedUpEvery: SPEED_UP_EVERY,
    });
    this.level         = new Level(this);
    this.player        = null;
    this.soldiers      = [];
    this.bullets       = [];
    this.cannons       = [];
    this.flags         = [];
    this.cameraX       = 0;
    this.cameraY       = 0;
    this.worldBottom   = CANVAS_HEIGHT + 20;
    this._timerStarted = false;
    this._levelBanner  = 0;
    this._playerDead   = false;
    this._terrain      = [];
    this._lastAliveX   = null;
    this._lastAliveY   = null;
  }

  get _levelData()   { return LEVELS_DATA[this.level.index]; }
  get _isVertical()  { return this._levelData.type === 'vertical'; }

  setupTerrain() {
    this._terrain    = getTerrain(this._levelData);
    this.worldBottom = this._isVertical ? WORLD_HEIGHT + 20 : CANVAS_HEIGHT + 20;
  }

  _update() {
    if (!this._timerStarted) {
      this._timerStarted = true;
      this.level.startTimer();
    }

    // Level-transition banner — freeze gameplay
    if (this._levelBanner > 0) {
      this._levelBanner--;
      this.level._timeUp = false;
      if (this._levelBanner === 0) {
        this.level._createTimer();
        this.level.startTimer();
        this.setupTerrain();
        if (this.onLevelSetup) this.onLevelSetup();
      }
      return;
    }

    // Time ran out → instant game over
    if (this.level._timeUp) {
      this.level._timeUp = false;
      this.level._done   = true;
      this.lives = 1;
      this.loseLife();
      return;
    }

    this._playerDead = false;
    const pl = this.player;
    if (!pl._dead) {
      this._lastAliveX = pl.x;
      this._lastAliveY = pl.y;
    }
    pl.update(this._terrain);

    // Camera follows player — horizontal or vertical depending on level type
    if (this._isVertical) {
      this.cameraX = 0;
      this.cameraY = Math.max(0, Math.min(this.player.y - CANVAS_HEIGHT * 2 / 3, WORLD_HEIGHT - CANVAS_HEIGHT));
    } else {
      this.cameraY = 0;
      this.cameraX = Math.max(0, Math.min(this.player.x - CANVAS_WIDTH / 3, WORLD_WIDTH - CANVAS_WIDTH));
    }

    // Update cannons
    for (const c of this.cannons) c.update(this.bullets);

    // Update soldiers (continue during player death animation)
    for (const s of this.soldiers) s.update(pl, this.bullets, this._terrain);
    this.soldiers = this.soldiers.filter(s => s.alive);

    // Update bullets
    for (const b of this.bullets) b.update();
    this.bullets = this.bullets.filter(b => b.alive);

    // If loseLife() was called this frame (death animation finished), skip collisions
    if (this._playerDead) return;

    // Player bullets vs soldiers
    for (const b of this.bullets) {
      if (b.owner !== 'player') continue;
      for (const s of this.soldiers) {
        if (!s._dead && isCollision(b, s)) {
          b.alive = false;
          s.hit();
          this.shake.trigger();
          break;
        }
      }
    }

    // Player bullets vs flags
    for (const b of this.bullets) {
      if (b.owner !== 'player') continue;
      for (const f of this.flags) {
        if (f.alive && isCollision(b, f)) {
          b.alive = false;
          f.alive = false;
          this.score += 10;
          break;
        }
      }
    }

    // Player walks into flags
    for (const f of this.flags) {
      if (f.alive && !pl._dead && isCollision(pl, f)) {
        f.alive = false;
        this.score += 10;
      }
    }
    this.flags = this.flags.filter(f => f.alive);

    // Player bullets vs cannons
    for (const b of this.bullets) {
      if (b.owner !== 'player') continue;
      for (const c of this.cannons) {
        if (c.alive && isCollision(b, c)) {
          b.alive  = false;
          c.alive  = false;
          this.score += 5;
          this.shake.trigger();
          break;
        }
      }
    }
    this.cannons = this.cannons.filter(c => c.alive);

    // Enemy bullets vs player
    if (!pl._dead && !pl.flash.active) {
      for (const b of this.bullets) {
        if (b.owner !== 'enemy') continue;
        if (isCollision(b, pl)) {
          b.alive = false;
          pl.die();
          this.shake.trigger();
          return;
        }
      }
    }

    // Player reached end
    if (!pl._dead) {
      if (this._isVertical  && pl.y <= this._levelData.endY) this.level.reachEnd();
      if (!this._isVertical && pl.x + pl.width >= this._levelData.endX) this.level.reachEnd();
    }
  }

  _drawWorld() {
    const { ctx, cameraX, cameraY } = this;
    drawBackground(ctx, cameraX, cameraY, this._isVertical);
    drawTerrain(ctx, this._levelData, cameraX, cameraY);

    for (const f of this.flags)    f.draw(ctx, cameraX, cameraY);
    for (const c of this.cannons)  c.draw(ctx, cameraX, cameraY);
    for (const s of this.soldiers) s.draw(ctx, cameraX, cameraY);
    for (const b of this.bullets)  b.draw(ctx, cameraX, cameraY);
    if (this.player) this.player.draw(ctx, cameraX, cameraY);

    // Level-transition countdown overlay
    if (this._levelBanner > 0) {
      const num = Math.ceil(this._levelBanner / 30);
      ctx.save();
      ctx.fillStyle = 'rgba(0,0,0,0.75)';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      ctx.textAlign    = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#fff';
      ctx.font      = 'bold 38px monospace';
      ctx.fillText(`LEVEL ${this.level.index + 1}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 50);
      ctx.fillStyle = '#ffeb3b';
      ctx.font      = 'bold 80px monospace';
      ctx.fillText(num, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 20);
      ctx.restore();
    }
  }

  drawHUD() {
    const { ctx } = this;
    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,0.45)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, 30);
    ctx.textBaseline = 'middle';

    ctx.font = 'bold 14px monospace';
    ctx.textAlign = 'left';
    for (let i = 0; i < this.lives; i++) {
      ctx.fillStyle = '#e53935';
      ctx.fillText('♥', 8 + i * 16, 15);
    }

    const secs = Math.ceil(this.level._remaining ?? 0);
    ctx.textAlign = 'center';
    ctx.fillStyle = secs <= 5 ? '#ff5252' : '#fff';
    ctx.fillText(`LVL ${this.level.index + 1}   TIME: ${secs}s`, CANVAS_WIDTH / 2, 15);

    ctx.textAlign = 'right';
    ctx.fillStyle = '#ffeb3b';
    ctx.fillText(`SCORE: ${this.score}`, CANVAS_WIDTH - 10, 15);

    ctx.restore();
  }

  loseLife() {
    this._playerDead = true;
    super.loseLife();
    if (this.onLoseLife) this.onLoseLife();
  }

  win()  { super.win(); }

  drawStartScreen()    { drawStartScreen(this.ctx, this.startButton); }
  drawPauseOverlay()   { drawPauseOverlay(this.ctx); }
  drawGameOverScreen() { drawGameOverScreen(this.ctx, this.score, this.restartButton); }
  drawWinScreen()      { drawWinScreen(this.ctx, this.score, this.restartButton); }
}

export default Game;
