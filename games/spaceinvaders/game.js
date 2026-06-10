import { isCollision, drawGrid } from './utils.js';
import {
  ALIEN_SCORE,
  GAME_STATE,
  GAME_OVER_TEXT,
  WIN_TEXT,
  START_IMAGE,
  INSTRUCTIONS,
  HEART_BEAT,
} from './constants.js';
import Button from './button.js';
import PixelButton from './pixelButton.js';
import Level from './level.js';
import GameTimer from './timer.js';

class Game {
  constructor(ctx, opts) {
    this.ctx = ctx;
    this.score = 0;
    this.level = new Level(this);
    this.opts = opts;
    this.paused = false;
    this.state = GAME_STATE.START;
    this.onRestart = null;
    this.onLevelSetup = null;
    this.transitioning = false;
    this.tick = 0;
  }

  init() {
    // Create buttons
    this.startButton = new PixelButton({ x: 21, y: 18, game: this, imageArr: START_IMAGE });
    this.pauseButton = new Button({
      x: this.opts.canvas.width - 10,
      y: this.opts.canvas.height - 10,
      game: this,
      text: 'PAUSE',
    });
    this.restartButton = new PixelButton({ x: 21, y: 28, game: this, imageArr: START_IMAGE });

    // Setup click handler
    this.opts.canvas.addEventListener('click', (e) => this.handleClick(e));

    // Show start screen
    this.drawStartScreen();
  }

  handleClick(e) {
    const rect = this.opts.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (this.state === GAME_STATE.START && this.startButton.isClicked(x, y)) {
      this.start();
      return;
    }

    if (
      (this.state === GAME_STATE.PLAYING || this.state === GAME_STATE.PAUSED) &&
      this.pauseButton.isClicked(x, y)
    ) {
      this.togglePause();
      return;
    }

    if (this.state === GAME_STATE.OVER && this.restartButton.isClicked(x, y)) {
      this.restart();
    }
  }

  drawInstructions() {
    this.ctx.save();
    this.ctx.font = '18px Courier';
    this.ctx.fillStyle = '#444';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'top';
    const cx = this.opts.canvas.width / 2;
    INSTRUCTIONS.forEach((line, i) => {
      this.ctx.fillText(line, cx, 320 + i * 24);
    });
    this.ctx.restore();
  }

  drawStartScreen() {
    this.ctx.clearRect(0, 0, this.opts.canvas.width, this.opts.canvas.height);
    drawGrid(this.ctx, this.width, this.height, this.blockSize);
    this.startButton.draw(this.ctx);
    this.drawInstructions();
  }

  async checkHit() {
    for (const bullet of this.spaceShip.bullets) {
      for (const alien of this.aliens) {
        if (!alien.deleted && !bullet.deleted && isCollision(bullet, alien)) {
          bullet.deleted = true;
          this.score += ALIEN_SCORE;
          alien.explode();
          break;
        }
      }
    }
    // Remove
    this.spaceShip.bullets = this.spaceShip.bullets.filter((b) => !b.deleted);
    this.aliens = this.aliens.filter((a) => !a.deleted);

    if (!this.aliens.length && !this.transitioning) {
      if (!this.level.isLast()) {
        await this.level.next();
      } else {
        this.win();
      }
    }
  }

  over(message = GAME_OVER_TEXT) {
    this.state = GAME_STATE.OVER;
    clearInterval(this.intervalId);
    this.intervalId = null;
    this.ctx.save();
    this.ctx.font = '60px Courier';
    this.ctx.fillStyle = 'Black';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(
      message,
      (this.width / 2) * this.blockSize,
      (this.height / 2) * this.blockSize
    );
    this.ctx.restore();
    this.restartButton.draw(this.ctx);
  }

  win() {
    this.over(WIN_TEXT);
  }

  start() {
    this.state = GAME_STATE.PLAYING;
    this.paused = false;
    this.pauseButton.setText('PAUSE');
    this.intervalId = setInterval(async () => {
      this.ctx.clearRect(0, 0, this.opts.canvas.width, this.opts.canvas.height);
      drawGrid(this.ctx, this.width, this.height, this.blockSize);
      this.aliens.forEach((alien) => alien.update().draw(this.ctx));
      this.spaceShip.update().draw(this.ctx);
      await this.checkHit();
      this.scoreBoard.update().draw(this.ctx);
      this.level.draw();
      if (this.transitionRenderer) {
        this.transitionRenderer();
      }
      // Only draw pause button if still playing
      if (this.state === GAME_STATE.PLAYING) {
        this.pauseButton.draw(this.ctx);
      }
      this.tick++;
    }, HEART_BEAT);
  }

  stop() {
    clearInterval(this.intervalId);
    this.intervalId = null;
  }

  pause() {
    this.state = GAME_STATE.PAUSED;
    this.paused = true;
    clearInterval(this.intervalId);
    this.intervalId = null;
    this.pauseButton.setText('PLAY');
    this.pauseButton.draw(this.ctx);
  }

  resume() {
    this.start();
  }

  togglePause() {
    if (this.paused) {
      this.resume();
    } else {
      this.pause();
    }
  }

  restart() {
    this.score = 0;
    this.level.reset();
    this.transitioning = false;
    if (this.onRestart) {
      this.onRestart();
    }
    this.start();
  }
}

export default Game;
