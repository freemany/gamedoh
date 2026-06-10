import { BaseGame } from './gamedoh-engine.js';
import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  BLOCK_SIZE,
  GROUND_HEIGHT,
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
    this.groundHeight = GROUND_HEIGHT;
    this.level = new Level(this);
  }

  _update() {
    this.clouds.update();
    this.ground.update();
    this.obstacles.forEach((o) => o.update());
    this.birds.forEach((b) => b.update());
    this.tRex.update();
  }

  _drawWorld() {
    this.clouds.draw(this.ctx);
    this.ground.draw(this.ctx);
    this.obstacles.forEach((o) => o.draw(this.ctx));
    this.birds.forEach((b) => b.draw(this.ctx));
    this.tRex.draw(this.ctx);
  }

  win() {
    super.win();
    const winAudio = document.getElementById('winAudio');
    if (winAudio) winAudio.loop = false;
  }

  loseLife() {
    if (this.tRex.invincible > 0) return;
    this.tRex.invincible = INVINCIBILITY_FRAMES;
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
    ctx.fillStyle = '#bbb';
    ctx.font = `${blockSize * 2}px monospace`;
    ctx.textAlign = 'center';
    ctx.fillText('[P] pause', this.canvasWidth / 2, blockSize * 1.5);
    ctx.restore();
  }
}

export default Game;
