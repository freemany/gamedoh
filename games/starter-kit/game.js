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
} from './constants.js';
import Level from './level.js';
import { drawStartScreen, drawPauseOverlay, drawGameOverScreen, drawWinScreen } from './screens.js';

const winAudio = document.getElementById('winAudio');

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
    this.tia.update();
  }

  _drawWorld() {
    const { ctx } = this;
    ctx.save();
    ctx.fillStyle = '#87ceeb';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx.fillStyle = '#4a7c3f';
    ctx.fillRect(0, CANVAS_HEIGHT - 60, CANVAS_WIDTH, 60);
    ctx.restore();
    this.tia.draw(ctx);
  }

  win() {
    super.win();
    if (winAudio) winAudio.loop = false;
  }

  loseLife() {
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
    ctx.fillStyle = '#c00';
    ctx.font = `bold ${blockSize * 3}px monospace`;
    ctx.textAlign = 'left';
    ctx.fillText('♥'.repeat(this.lives), blockSize * 2, blockSize * 1.5);
    ctx.fillStyle = '#333';
    ctx.font = `${blockSize * 2}px monospace`;
    ctx.textAlign = 'center';
    ctx.fillText('[P] pause', CANVAS_WIDTH / 2, blockSize * 1.5);
    ctx.restore();
  }
}

export default Game;
