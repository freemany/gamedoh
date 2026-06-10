import { BaseGame, Camera, LevelIntro } from './gamedoh-engine.js';
import {
  BLOCK_SIZE,
  HEART_BEAT,
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  WORLD_WIDTH,
  WORLD_HEIGHT,
  IDLE,
} from './constants.js';
import Level from './level.js';
import { stopRunAudio } from './playerStates.js';
import {
  drawStartScreen,
  drawPauseOverlay,
  drawGameOverScreen,
  drawWinScreen,
} from './screens.js';

class Game extends BaseGame {
  constructor(ctx, opts) {
    super(ctx, opts, {
      canvasWidth: CANVAS_WIDTH,
      canvasHeight: CANVAS_HEIGHT,
      blockSize: BLOCK_SIZE,
      heartbeat: HEART_BEAT,
      lives: 1,
      initialSpeed: 1,
      maxSpeed: 1,
      speedUpEvery: 999,
    });

    this.camera = new Camera({
      worldWidth: WORLD_WIDTH,
      worldHeight: WORLD_HEIGHT,
      viewWidth: CANVAS_WIDTH / BLOCK_SIZE,
      viewHeight: CANVAS_HEIGHT / BLOCK_SIZE,
    });
    this.camera.follow(WORLD_WIDTH / 2, WORLD_HEIGHT / 2);

    this.level = new Level(this);
    this._transitioning = false;
    this._pendingLevelStart = true;
    this.carrots = [];
    this.rocks = [];
    this.player = null;
  }

  _update() {
    if (this._transitioning) return;

    if (this._pendingLevelStart) {
      this._pendingLevelStart = false;
      this._startFirstLevel();
      return;
    }

    // Time up → game over (lives: 1 so loseLife() triggers GAME_OVER)
    if (this.level._timeUp) {
      this.level._timeUp = false;
      stopRunAudio();
      this.loseLife();
      return;
    }

    // Input
    const k = this._keys || {};
    let moved = false;
    if (k['ArrowUp'])    { this.player.move('u'); moved = true; }
    if (k['ArrowDown'])  { this.player.move('d'); moved = true; }
    if (k['ArrowLeft'])  { this.player.move('l'); moved = true; }
    if (k['ArrowRight']) { this.player.move('r'); moved = true; }
    if (!moved) this.player.idle();

    this.player.update();
    this._checkCollision();
  }

  async _startFirstLevel() {
    this._transitioning = true;
    await new LevelIntro(this, this.level.index + 1).start();
    if (this.onLevelSetup) this.onLevelSetup();
    this.level.timer.start();
    this._transitioning = false;
  }

  _checkCollision() {
    this.carrots = this.carrots.filter((carrot) => {
      const dx = Math.abs(this.player.worldX - (carrot.worldX + carrot.halfW));
      const dy = Math.abs(this.player.worldY - (carrot.worldY + carrot.halfH));
      if (dx < this.player.halfW + carrot.halfW && dy < this.player.halfH + carrot.halfH) {
        this.score++;
        this.player.eat();
        return false;
      }
      return true;
    });

    if (this.carrots.length === 0 && !this._transitioning) {
      this.level.reachEnd();
    }
  }

  _drawWorld() {
    this._drawScrollingGrid();
    this._drawBoundary();
    this.rocks.forEach((r) => r.draw(this.ctx));
    this.carrots.forEach((c) => c.draw(this.ctx));
    if (this.player) this.player.draw(this.ctx);
  }

  _drawScrollingGrid() {
    const { ctx, camera, blockSize } = this;
    const { x: camX, y: camY } = camera;
    const spacing = 10;
    const pixelSpacing = spacing * blockSize;
    const offsetX = (camX % spacing) * blockSize;
    const offsetY = (camY % spacing) * blockSize;
    ctx.save();
    ctx.strokeStyle = 'lightgrey';
    ctx.lineWidth = 0.5;
    for (let x = -offsetX; x <= CANVAS_WIDTH; x += pixelSpacing) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, CANVAS_HEIGHT);
      ctx.stroke();
    }
    for (let y = -offsetY; y <= CANVAS_HEIGHT; y += pixelSpacing) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(CANVAS_WIDTH, y);
      ctx.stroke();
    }
    ctx.restore();
  }

  _drawBoundary() {
    const { ctx, camera, blockSize } = this;
    const { x: camX, y: camY } = camera;
    const left = (0 - camX) * blockSize;
    const top = (0 - camY) * blockSize;
    const right = (WORLD_WIDTH - camX) * blockSize;
    const bottom = (WORLD_HEIGHT - camY) * blockSize;
    ctx.save();
    ctx.strokeStyle = '#c0392b';
    ctx.lineWidth = 3;
    ctx.setLineDash([10, 6]);
    ctx.strokeRect(left, top, right - left, bottom - top);
    ctx.restore();
  }

  drawHUD() {
    if (this._transitioning) return;
    const { ctx, blockSize } = this;
    const gridW = CANVAS_WIDTH / BLOCK_SIZE;

    ctx.save();
    ctx.fillStyle = 'black';
    ctx.font = '20px Arial';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(
      `Level ${this.level.index + 1}  Carrots: ${this.score}`,
      2 * blockSize,
      2 * blockSize
    );
    ctx.restore();

    const t = this.level._remaining;
    ctx.save();
    ctx.fillStyle = t <= 10 ? '#c0392b' : 'black';
    ctx.font = '20px Arial';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'top';
    ctx.fillText(`Time: ${t}s`, (gridW - 2) * blockSize, 2 * blockSize);
    ctx.restore();
  }

  drawStartScreen()    { drawStartScreen(this.ctx, this.startButton); }
  drawPauseOverlay()   { drawPauseOverlay(this.ctx); }
  drawGameOverScreen() { drawGameOverScreen(this.ctx, this.score, this.restartButton); }
  drawWinScreen()      { drawWinScreen(this.ctx, this.score, this.restartButton); }
}

export default Game;
