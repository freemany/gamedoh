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
  JUMP_VY,
  PLATFORM_COUNT,
  LEVEL_PLATFORM_W,
  LEVEL_PLATFORM_GAP,
  LEVEL_TARGET,
} from './constants.js';
import Level from './level.js';
import Platform from './platform.js';
import { playSound } from './sounds.js';
import { drawStartScreen, drawPauseOverlay, drawGameOverScreen, drawWinScreen } from './screens.js';

const randomX = (max) => Math.floor(Math.random() * max);

const overAudio = document.getElementById('overAudio');

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
    this.player = null;
    this.platforms = [];
    this._timerStarted = false;
    this._levelBanner = 0;
    this._levelScroll = 0; // pixels climbed within the current level
  }

  // ── Platform config (per level) ───────────────────────────────────────────

  _platW() {
    return LEVEL_PLATFORM_W[this.level.index] ?? LEVEL_PLATFORM_W.at(-1);
  }
  _platGap() {
    return LEVEL_PLATFORM_GAP[this.level.index] ?? LEVEL_PLATFORM_GAP.at(-1);
  }

  // ── Platform management ───────────────────────────────────────────────────

  initPlatforms() {
    const w = this._platW();
    const gap = this._platGap();
    this.platforms = [];
    this.platforms.push(new Platform(CANVAS_WIDTH / 2 - w / 2, CANVAS_HEIGHT - 80, w));
    for (let i = 1; i < PLATFORM_COUNT; i++) {
      const y = CANVAS_HEIGHT - 80 - i * gap;
      const x = randomX(CANVAS_WIDTH - w);
      this.platforms.push(new Platform(x, y, w));
    }
  }

  _topPlatformY() {
    if (!this.platforms.length) return CANVAS_HEIGHT;
    return Math.min(...this.platforms.map((p) => p.y));
  }

  _spawnPlatform() {
    const w = this._platW();
    const x = randomX(CANVAS_WIDTH - w);
    this.platforms.push(new Platform(x, this._topPlatformY() - this._platGap(), w));
  }

  // ── Collision ─────────────────────────────────────────────────────────────

  _checkPlatformCollisions() {
    const pl = this.player;
    if (pl.vy <= 0) return;

    const feetY = pl.y + pl.height;
    const prevFeetY = feetY - pl.vy;

    for (const plat of this.platforms) {
      if (
        prevFeetY <= plat.y &&
        feetY >= plat.y &&
        pl.x + pl.width > plat.x &&
        pl.x < plat.x + plat.w
      ) {
        pl.vy = JUMP_VY;
        pl.y = plat.y - pl.height;
        playSound('jump');
        break;
      }
    }
  }

  // ── BaseGame overrides ───────────────────────────────────────────────────

  _update() {
    // Start level timer on the first frame of play
    if (!this._timerStarted) {
      this._timerStarted = true;
      this.level.startTimer();
    }

    // Level-transition banner: freeze gameplay, then start next level
    if (this._levelBanner > 0) {
      this._levelBanner--;
      this.level._timeUp = false; // ignore timer events during transition
      if (this._levelBanner === 0) {
        this.level._createTimer();
        this.level.startTimer();
        if (this.onLevelSetup) this.onLevelSetup();
      }
      return;
    }

    // Time ran out → player loses
    if (this.level._timeUp) {
      this.level._timeUp = false;
      this.level._done = true;
      playSound('death');
      if (overAudio) {
        overAudio.currentTime = 0;
        overAudio.play().catch(() => {});
      }
      this.lives = 1;
      this.loseLife();
      return;
    }

    const pl = this.player;
    pl.update();

    this._checkPlatformCollisions();

    // Scroll camera up when player rises above midpoint
    if (pl.y < CANVAS_HEIGHT / 2) {
      const scroll = CANVAS_HEIGHT / 2 - pl.y;
      pl.y = CANVAS_HEIGHT / 2;
      for (const plat of this.platforms) plat.y += scroll;
      const px = Math.floor(scroll);
      this.addScore(px);
      this._levelScroll += px;
    }

    // Player reached the top of this level
    if (this._levelScroll >= LEVEL_TARGET[this.level.index]) {
      this.level.reachEnd();
      return;
    }

    // Cull off-screen platforms and replenish
    this.platforms = this.platforms.filter((plat) => plat.y < CANVAS_HEIGHT);
    while (this.platforms.length < PLATFORM_COUNT) this._spawnPlatform();
    while (this._topPlatformY() > 0) this._spawnPlatform();

    // Game over: player fell below canvas
    if (pl.y > CANVAS_HEIGHT) {
      playSound('death');
      if (overAudio) {
        overAudio.currentTime = 0;
        overAudio.play().catch(() => {});
      }
      this.lives = 1;
      this.loseLife();
    }
  }

  _drawWorld() {
    const { ctx } = this;

    // Sky — level 2 gets a darker sky
    ctx.save();
    const grad = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    if (this.level.index === 0) {
      grad.addColorStop(0, '#b3e5fc');
      grad.addColorStop(1, '#e0f7fa');
    } else {
      grad.addColorStop(0, '#546e7a');
      grad.addColorStop(1, '#90a4ae');
    }
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx.restore();

    // Goal line — visible when player is within one screen-height of the target
    const target = LEVEL_TARGET[this.level.index];
    const remaining = Math.max(0, target - this._levelScroll);
    if (remaining < CANVAS_HEIGHT) {
      const goalY = CANVAS_HEIGHT / 2 - remaining; // canvas y of finish line
      ctx.save();
      ctx.strokeStyle = '#ff6f00';
      ctx.lineWidth = 4;
      ctx.setLineDash([14, 7]);
      ctx.beginPath();
      ctx.moveTo(0, goalY);
      ctx.lineTo(CANVAS_WIDTH, goalY);
      ctx.stroke();
      // Flag label
      ctx.setLineDash([]);
      ctx.fillStyle = '#ff6f00';
      ctx.font = 'bold 13px monospace';
      ctx.textBaseline = 'bottom';
      ctx.textAlign = 'left';
      ctx.fillText('▲ TOP', 8, goalY - 2);
      ctx.restore();
    }

    for (const plat of this.platforms) plat.draw(ctx);
    this.player.draw(ctx);

    // Level-transition overlay with 3-2-1 countdown
    if (this._levelBanner > 0) {
      const countNum = Math.ceil(this._levelBanner / 30);
      ctx.save();
      ctx.fillStyle = 'rgba(0,0,0,0.7)';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 48px monospace';
      ctx.fillText(`LEVEL ${this.level.index + 1}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 80);
      ctx.fillStyle = '#aaa';
      ctx.font = '16px monospace';
      ctx.fillText('Platforms are smaller & farther!', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 34);
      ctx.fillStyle = '#ffeb3b';
      ctx.font = 'bold 100px monospace';
      ctx.fillText(countNum, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 50);
      ctx.restore();
    }
  }

  drawHUD() {
    const { ctx } = this;
    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, 36);
    ctx.textBaseline = 'middle';

    // Score / height
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 14px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`HEIGHT: ${this.score}`, 12, 18);

    // Level and countdown timer
    const secs = Math.ceil(this.level._remaining ?? 0);
    ctx.textAlign = 'center';
    ctx.fillStyle = secs <= 3 ? '#ff5252' : '#fff';
    ctx.fillText(`LVL ${this.level.index + 1}   ${secs}s`, CANVAS_WIDTH / 2, 18);

    // Pause hint
    ctx.fillStyle = 'rgba(255,255,255,0.45)';
    ctx.font = '12px monospace';
    ctx.textAlign = 'right';
    ctx.fillText('[P] pause', CANVAS_WIDTH - 12, 18);

    // Right-side progress bar toward level goal
    const target = LEVEL_TARGET[this.level.index];
    const progress = Math.min(1, this._levelScroll / target);
    const barH = CANVAS_HEIGHT - 80;
    const barX = CANVAS_WIDTH - 10;
    const barY = 46;
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(barX, barY, 6, barH);
    ctx.fillStyle = '#ff6f00';
    ctx.fillRect(barX, barY + barH * (1 - progress), 6, barH * progress);
    // Goal flag at top
    ctx.fillStyle = '#ff6f00';
    ctx.fillRect(barX - 2, barY, 10, 3);

    ctx.restore();
  }

  win() {
    const winAudio = document.getElementById('winAudio');
    if (winAudio) winAudio.volume = 0;
    super.win();
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
}

export default Game;
