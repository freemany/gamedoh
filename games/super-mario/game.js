import { BaseGame } from './gamedoh-engine.js';
import {
  CANVAS_WIDTH, CANVAS_HEIGHT, BLOCK_SIZE, TILE_SIZE,
  HEART_BEAT, LIVES, INITIAL_SPEED, MAX_SPEED, SPEED_UP_EVERY,
  WORLD_WIDTH, COIN_SCORE, TILE_HEIGHT,
} from './constants.js';
import Level from './level.js';
import { getTiles, drawTilemap, drawClouds } from './tilemap.js';
import { LEVEL_1, LEVEL_2 } from './tilemap.js';
import { drawStartScreen, drawPauseOverlay, drawGameOverScreen, drawWinScreen } from './screens.js';
import { playSound } from './sounds.js';
import Mushroom from './mushroom/index.js';

const LAYOUTS = [LEVEL_1, LEVEL_2];

const winAudio  = document.getElementById('winAudio');
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
    this.cameraX = 0;
    this.mushrooms = [];
    this.coins = [];
    this.blockHits = new Map(); // tracks hit count per ? block index
    this.spawnedPipes = new Set();
  }

  get currentLayout() {
    return LAYOUTS[Math.min(this.level.index, LAYOUTS.length - 1)];
  }

  _update() {
    const tiles = getTiles(this.currentLayout);
    const layout = this.currentLayout;
    const TS = TILE_SIZE * BLOCK_SIZE;

    // Save vy BEFORE update — tile resolver resets it to 0 on ceiling hit
    const marioVyBefore = this.mario.vy;
    this.mario.update(tiles, this.cameraX);
    this.goombas.forEach((g) => g.update(tiles, this.cameraX, this.mario));
    this.goombas = this.goombas.filter((g) => g.alive);

    // Question block hit detection (Mario bumps from below)
    // After update: mario.y === blockBottom (tile resolver placed him there), vy === 0
    // Use marioVyBefore < 0 to confirm he was moving upward
    if (!this.mario._dead) {
      layout.questions.forEach(({ x, y }, i) => {
        if ((this.blockHits.get(i) || 0) >= 3) return; // already exhausted
        const bx = x * TS;
        const by = CANVAS_HEIGHT - (y + 1) * TS;
        const blockBottom = by + TILE_HEIGHT;
        if (
          marioVyBefore < 0 &&
          Math.abs(this.mario.y - blockBottom) <= 2 &&
          this.mario.x + this.mario.width > bx &&
          this.mario.x < bx + TS
        ) {
          const hits = (this.blockHits.get(i) || 0) + 1;
          this.blockHits.set(i, hits);
          if (hits >= 3) {
            this.addScore(COIN_SCORE);
            playSound('coin');
            this.playPowerUpSound();
            this.coins.push({ x: bx + TS / 2, y: by, vy: -5, life: 40 });
          }
        }
      });
    }

    // Coin animations
    this.coins.forEach((c) => { c.y += c.vy; c.vy += 0.4; c.life--; });
    this.coins = this.coins.filter((c) => c.life > 0);

    // Mushroom spawn: spawn from each pipe when Mario is within 5 tiles
    layout.pipes.forEach(({ x, h }, i) => {
      if (this.spawnedPipes.has(i)) return;
      const pipePixelX = x * TS;
      const dist = Math.abs(this.mario.x - pipePixelX);
      if (dist < 5 * TS) {
        this.spawnedPipes.add(i);
        const groundY = CANVAS_HEIGHT - TS;
        const pipeTopY = groundY - h * TILE_HEIGHT; // TH=32 per pipe row
        this.mushrooms.push(new Mushroom(this, pipePixelX, pipeTopY));
      }
    });

    // Mushroom updates
    this.mushrooms.forEach((m) => m.update(tiles, this.mario));
    this.mushrooms = this.mushrooms.filter((m) => m.alive);

    // Camera follow
    const targetX = this.mario.x - CANVAS_WIDTH / 3;
    this.cameraX = Math.max(0, Math.min(targetX, WORLD_WIDTH - CANVAS_WIDTH));

    // Time ran out — immediate game over, no death animation
    if (this.level._timeUp && !this.mario._dead) {
      this.level._timeUp = false;
      this._timeoutGameOver = true;
      this._wasTimeUp = true;
      this.lives = 1; // super.loseLife() will decrement to 0 → game over
      this.loseLife();
      return;
    }

    // Mario reached the end of the world → advance or win
    if (!this.mario._dead && this.mario.x >= WORLD_WIDTH - this.mario.width - 4) {
      this.level.reachEnd();
    }
  }

  _drawWorld() {
    const { ctx } = this;
    ctx.save();
    // Sky
    ctx.fillStyle = '#5c94fc';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx.restore();

    drawClouds(ctx, this.cameraX);
    drawTilemap(ctx, this.cameraX, this.currentLayout, this.blockHits);
    this.goombas.forEach((g) => g.draw(ctx, this.cameraX));
    this.mushrooms.forEach((m) => m.draw(ctx, this.cameraX));

    // Coin pop animations
    ctx.save();
    ctx.fillStyle = '#f8d800';
    this.coins.forEach((c) => {
      ctx.beginPath();
      ctx.arc(c.x - this.cameraX, c.y, 8, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();

    this.mario.draw(ctx, this.cameraX);
  }

  playPowerUpSound() {
    if (winAudio) {
      winAudio.loop = false;
      winAudio.currentTime = 0;
      winAudio.play().catch(() => {});
    }
  }

  win() {
    super.win();
    if (winAudio) winAudio.loop = false;
  }

  loseLife() {
    this.mushrooms = [];
    this.coins = [];
    this.spawnedPipes = new Set();
    // On timeout, skip respawn and go straight to game over
    if (this._timeoutGameOver) {
      this._timeoutGameOver = false;
      super.loseLife();
      if (overAudio) { overAudio.currentTime = 0; overAudio.play().catch(() => {}); }
      return;
    }
    this._respawnX = Math.max(64, this.mario._lastGroundX ?? this.mario.x);
    this.mario._dead = false;
    if (this.onLoseLife) this.onLoseLife();
    super.loseLife();
    // Play game over music when last life is lost
    if (this.lives <= 0) {
      if (overAudio) { overAudio.currentTime = 0; overAudio.play().catch(() => {}); }
    }
  }

  drawStartScreen()    { drawStartScreen(this.ctx, this.startButton); }
  drawPauseOverlay()   { drawPauseOverlay(this.ctx); }
  drawGameOverScreen() { drawGameOverScreen(this.ctx, this.score, this.restartButton, this._wasTimeUp); }
  drawWinScreen()      { drawWinScreen(this.ctx, this.score, this.restartButton); }

  drawHUD() {
    const { ctx } = this;
    ctx.save();

    // Semi-transparent backing strip
    ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, 42);

    ctx.textBaseline = 'top';

    // ── Labels row (y=6) ──────────────────────────────
    ctx.font = 'bold 11px monospace';
    ctx.fillStyle = '#555';

    ctx.textAlign = 'left';
    ctx.fillText('LIVES', 10, 6);

    ctx.textAlign = 'center';
    ctx.fillText('MARIO', CANVAS_WIDTH * 0.38, 6);

    ctx.textAlign = 'center';
    ctx.fillText(`WORLD 1-${this.level.number}`, CANVAS_WIDTH * 0.65, 6);

    ctx.textAlign = 'right';
    ctx.fillText('TIME', CANVAS_WIDTH - 10, 6);

    // ── Values row (y=20) ─────────────────────────────
    ctx.font = 'bold 16px monospace';
    ctx.fillStyle = '#222';

    ctx.textAlign = 'left';
    ctx.fillStyle = '#c00';
    ctx.fillText('♥'.repeat(this.lives), 10, 20);

    ctx.fillStyle = '#222';
    ctx.textAlign = 'center';
    ctx.fillText(String(this.score).padStart(6, '0'), CANVAS_WIDTH * 0.38, 20);

    ctx.textAlign = 'right';
    ctx.fillText(this.level._remaining ?? '--', CANVAS_WIDTH - 10, 20);

    // ── Pause hint ────────────────────────────────────
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.font = '12px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('[P] pause', CANVAS_WIDTH / 2, CANVAS_HEIGHT - 18);

    ctx.restore();
  }
}

export default Game;
