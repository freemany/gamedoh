import { BaseGame } from './gamedoh-engine.js';
import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  BLOCK_SIZE,
  HEART_BEAT,
  LIVES,
  INITIAL_SPEED,
  MAX_SPEED,
  SPEED_UP_EVERY,
  INVINCIBILITY_FRAMES,
} from './constants.js';
import Level from './level.js';
import { drawStartScreen, drawPauseOverlay, drawGameOverScreen, drawWinScreen } from './screens.js';

class Game extends BaseGame {
  constructor(ctx, opts) {
    super(ctx, opts, {
      canvasWidth: CANVAS_WIDTH,
      canvasHeight: CANVAS_HEIGHT,
      blockSize: BLOCK_SIZE,
      heartbeat: HEART_BEAT,
      lives: LIVES,
      initialSpeed: INITIAL_SPEED,
      maxSpeed: MAX_SPEED,
      speedUpEvery: SPEED_UP_EVERY,
    });
    this.level = new Level(this);
  }

  _update() {
    this.road.update();
    this.opponents.forEach((o) => o.update());
    this.boss?.update();
    this.playerCar.update();
  }

  _drawWorld() {
    this.road.draw(this.ctx);
    this.opponents.forEach((o) => o.draw(this.ctx));
    this.boss?.draw(this.ctx);
    this.playerCar.draw(this.ctx);
  }

  loseLife() {
    if (this.playerCar.invincible > 0) return;
    this.playerCar.invincible = INVINCIBILITY_FRAMES;
    super.loseLife();
  }

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

  drawHUD() {
    const { ctx, blockSize } = this;
    ctx.save();
    ctx.textBaseline = 'top';
    ctx.fillStyle = '#e33';
    ctx.font = `bold ${blockSize * 3}px monospace`;
    ctx.textAlign = 'left';
    ctx.fillText('♥'.repeat(this.lives), blockSize * 2, blockSize * 1.5);
    if (this.boss) {
      ctx.fillStyle = '#f50';
      ctx.font = `bold ${blockSize * 2.5}px monospace`;
      ctx.textAlign = 'right';
      ctx.fillText('⚠ BOSS!', this.canvasWidth - blockSize * 2, blockSize * 1.5);
    }
    ctx.fillStyle = '#aaa';
    ctx.font = `${blockSize * 2}px monospace`;
    ctx.textAlign = 'center';
    ctx.fillText('[P] pause', this.canvasWidth / 2, blockSize * 13);
    ctx.restore();
  }
}

export default Game;
