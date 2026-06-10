import { GAME_STATE } from './constants.js';
import Button from './Button.js';
import SoundManager from './SoundManager.js';
import { stopAllAudio, Shake } from '../utils.js';

// Base Game class. Subclass and override:
//   _update()        — update entities each tick
//   _drawWorld()     — render entities
//   drawStartScreen / drawPauseOverlay / drawGameOverScreen / drawWinScreen / drawHUD
//
// Set this.level (with a .timer) and this.scoreBoard from main.js or constructor.
// Call loseLife() with entity-specific guards in subclass, then super.loseLife().

class Game {
  constructor(ctx, opts, {
    canvasWidth,
    canvasHeight,
    blockSize,
    heartbeat = 30,
    lives = 3,
    initialSpeed = 1,
    maxSpeed = 5,
    speedUpEvery = 200,
  } = {}) {
    this.ctx = ctx;
    this.opts = opts;
    this.canvasWidth  = canvasWidth;
    this.canvasHeight = canvasHeight;
    this.blockSize    = blockSize;
    this.width        = canvasWidth / blockSize;
    this.height       = canvasHeight / blockSize;
    this._heartbeat   = heartbeat;
    this._initialLives = lives;
    this._initialSpeed = initialSpeed;
    this._maxSpeed     = maxSpeed;
    this._speedUpEvery = speedUpEvery;

    this.state          = GAME_STATE.START;
    this.tick           = 0;
    this.score          = 0;
    this.lives          = lives;
    this.speed          = initialSpeed;
    this.sounds         = new SoundManager();
    this._lastSpeedUp   = 0;
    this._won           = false;
    this.intervalId     = null;
    this.transitioning  = false;
    this.transitionRenderer = null;
    this.onRestart      = null;
    this.onLevelSetup   = null;
    this.shake          = new Shake();
  }

  // ── Abstract — override in subclass ────────────────────────────

  _update() {}     // update all entities each tick
  _drawWorld() {}  // render all entities

  drawStartScreen()    {}
  drawPauseOverlay()   {}
  drawGameOverScreen() {}
  drawWinScreen()      {}
  drawHUD()            {}

  // ── Lifecycle ──────────────────────────────────────────────────

  init() {
    const cx = this.canvasWidth / 2;
    const cy = this.canvasHeight / 2;
    const bw = 120, bh = 36;
    this.startButton = new Button({
      x: cx + bw / 2, y: cy + bh / 2 + 80,
      game: this, text: 'START', width: bw, height: bh,
    });
    this.restartButton = new Button({
      x: cx + bw / 2, y: cy + bh / 2 + 80,
      game: this, text: 'RESTART', width: bw, height: bh,
    });
    this.opts.canvas.addEventListener('click', (e) => {
      const rect = this.opts.canvas.getBoundingClientRect();
      this.handleClick(e.clientX - rect.left, e.clientY - rect.top);
    });
    this.drawStartScreen();
  }

  start() {
    this.sounds.start();
    this.state = GAME_STATE.PLAYING;
    this.level?.timer?.start();
    this.intervalId = setInterval(() => this._loop(), this._heartbeat);
  }

  pause() {
    this.state = GAME_STATE.PAUSED;
    this.level?.timer?.pause();
    clearInterval(this.intervalId);
    this.intervalId = null;
    this._drawWorldShaked();
    this.scoreBoard?.draw(this.ctx);
    this.level?.draw();
    this.drawHUD();
    this.drawPauseOverlay();
  }

  resume() {
    this.state = GAME_STATE.PLAYING;
    this.level?.timer?.start();
    this.intervalId = setInterval(() => this._loop(), this._heartbeat);
  }

  togglePause() {
    if (this.state === GAME_STATE.PAUSED) this.resume();
    else this.pause();
  }

  over() {
    const overAudio = document.getElementById('overAudio');
    if (overAudio) { overAudio.currentTime = 0; overAudio.play(); }
    this.state = GAME_STATE.OVER;
    clearInterval(this.intervalId);
    this.intervalId = null;
    this._drawWorldShaked();
    this.scoreBoard?.draw(this.ctx);
    this.level?.draw();
    this.drawHUD();
    if (this._won) this.drawWinScreen();
    else this.drawGameOverScreen();
  }

  win() {
    this._won = true;
    const winAudio = document.getElementById('winAudio');
    if (winAudio) { winAudio.loop = true; winAudio.currentTime = 0; winAudio.play(); }
    this.over();
  }

  restart() {
    stopAllAudio();
    this.score        = 0;
    this.lives        = this._initialLives;
    this.speed        = this._initialSpeed;
    this.tick         = 0;
    this._lastSpeedUp = 0;
    this._won         = false;
    this.transitioning = false;
    this.transitionRenderer = null;
    this.level?.reset();
    if (this.onRestart) this.onRestart();
    this.start();
  }

  // ── Game loop ──────────────────────────────────────────────────

  _loop() {
    this.tick++;
    this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);

    if (!this.transitioning) {
      this.level?.timer?.update();
      this._update();
    }

    if (this.state !== GAME_STATE.PLAYING) return;

    this._drawWorldShaked();
    this.scoreBoard?.draw(this.ctx);
    this.level?.draw();
    this.drawHUD();

    if (this.transitionRenderer) this.transitionRenderer();
  }

  // Applies shake around _drawWorld so HUD/score are unaffected
  _drawWorldShaked() {
    const { ctx } = this;
    ctx.save();
    this.shake.apply(ctx);
    this._drawWorld();
    ctx.restore();
  }

  // ── Score / difficulty ─────────────────────────────────────────

  addScore(pts = 1) {
    this.score += pts;
    if (this.score - this._lastSpeedUp >= this._speedUpEvery) {
      this._lastSpeedUp = this.score;
      this.speed = Math.min(this.speed + 0.4, this._maxSpeed);
      this.sounds.levelUp();
    }
  }

  // Core loseLife — subclass should guard invincibility then call super
  loseLife() {
    if (this.state !== GAME_STATE.PLAYING || this.transitioning) return;
    this.lives--;
    this.shake.trigger();
    this.sounds.hit();
    if (this.lives <= 0) this.over();
  }

  // ── Input ──────────────────────────────────────────────────────

  handleClick(x, y) {
    if (this.state === GAME_STATE.START && this.startButton.isClicked(x, y)) { this.start(); return; }
    if (this.state === GAME_STATE.OVER && this.restartButton.isClicked(x, y)) { this.restart(); }
  }

  handleKey(key) {
    if (key === 'Enter' || key === ' ') {
      if (this.state === GAME_STATE.START) { this.start(); return; }
      if (this.state === GAME_STATE.OVER)  { this.restart(); return; }
    }
    if (key === 'p' || key === 'P' || key === 'Escape') {
      if (this.state === GAME_STATE.PLAYING || this.state === GAME_STATE.PAUSED) this.togglePause();
    }
  }
}

export default Game;
