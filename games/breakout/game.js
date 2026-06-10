import { BaseGame, isCollision, LevelIntro, SoundManager, delay } from './gamedoh-engine.js';
import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  BLOCK_SIZE,
  HEART_BEAT,
  LIVES,
  BRICK_W,
  BRICK_H,
  BALL_SIZE,
  BRICK_SCORE,
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
      initialSpeed: 1,
      maxSpeed: 1,
      speedUpEvery: 9999,
    });

    this.level = new Level(this);
    this._sound = new SoundManager();
    this._transitioning = false;
    this._pendingLevelStart = false;
    this._ballOutCountdown = 0;
    this.ball = null;
    this.paddle = null;
    this.bricks = [];
  }

  _update() {
    if (this._transitioning) return;

    if (this._pendingLevelStart) {
      this._pendingLevelStart = false;
      this._startFirstLevel();
      return;
    }

    // Paddle input
    if (this._keys['ArrowLeft']) this.paddle.move('left');
    if (this._keys['ArrowRight']) this.paddle.move('right');

    this.ball.update();
    this._checkBrickCollisions();

    // Level complete when all bricks destroyed
    if (this.bricks.length > 0 && this.bricks.every((b) => !b.alive)) {
      this.level.advance();
    }
  }

  _checkBrickCollisions() {
    for (const brick of this.bricks) {
      if (!brick.alive) continue;
      if (!isCollision(this.ball, brick)) continue;

      brick.alive = false;
      this.addScore(BRICK_SCORE);
      this._sound.hit();

      // Determine bounce axis: compare overlap on each axis
      const ballCX = this.ball.x + BALL_SIZE / 2;
      const ballCY = this.ball.y + BALL_SIZE / 2;
      const brickCX = brick.x + BRICK_W / 2;
      const brickCY = brick.y + BRICK_H / 2;
      const overlapX = (BALL_SIZE + BRICK_W) / 2 - Math.abs(ballCX - brickCX);
      const overlapY = (BALL_SIZE + BRICK_H) / 2 - Math.abs(ballCY - brickCY);

      if (overlapX < overlapY) {
        this.ball.vx *= -1;
      } else {
        this.ball.vy *= -1;
      }
      break; // one brick collision per frame
    }
  }

  async _startFirstLevel() {
    this._transitioning = true;
    await new LevelIntro(this, this.level.index + 1).start();
    if (this.onLevelSetup) this.onLevelSetup();
    this._transitioning = false;
  }

  _drawWorld() {
    const { ctx } = this;

    // Background
    ctx.fillStyle = '#0d1b2a';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Bricks
    this.bricks.forEach((b) => b.draw(ctx));

    // Paddle
    if (this.paddle) this.paddle.draw(ctx);

    // Ball
    if (this.ball) this.ball.draw(ctx);
  }

  async loseLife() {
    // Play sad audio
    const ballOutAudio = document.getElementById('ballOutAudio');
    if (ballOutAudio) {
      ballOutAudio.currentTime = 0;
      ballOutAudio.play().catch(() => {});
    }

    if (this.shake) this.shake.trigger();

    // Freeze game and count down 3 seconds
    this._transitioning = true;
    for (let i = 3; i > 0; i--) {
      this._ballOutCountdown = i;
      await delay(1000);
    }
    this._ballOutCountdown = 0;
    this._transitioning = false;

    super.loseLife();
    if (this.lives > 0 && this.ball) this.ball.reset();
  }

  win() {
    super.win();
    const winAudio = document.getElementById('winAudio');
    if (winAudio) winAudio.loop = false;
  }

  drawHUD() {
    if (this._transitioning) return;
    const { ctx } = this;
    ctx.save();

    // Lives — top left
    ctx.textBaseline = 'top';
    ctx.fillStyle = '#e53935';
    ctx.font = 'bold 22px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('♥'.repeat(this.lives), 12, 10);

    // Score — top right
    ctx.fillStyle = 'white';
    ctx.font = '18px monospace';
    ctx.textAlign = 'right';
    ctx.fillText(`Score: ${this.score}`, CANVAS_WIDTH - 12, 10);

    // Level — top centre
    ctx.fillStyle = '#90caf9';
    ctx.font = '16px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`Level ${this.level.index + 1}  [P] pause`, CANVAS_WIDTH / 2, 12);

    // Ball-out countdown overlay
    if (this._ballOutCountdown > 0) {
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      ctx.fillStyle = '#e53935';
      ctx.font = 'bold 28px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('Ball Out!', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 30);
      ctx.fillStyle = 'white';
      ctx.font = 'bold 72px monospace';
      ctx.fillText(this._ballOutCountdown, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 30);
    }

    ctx.restore();
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
}

export default Game;
