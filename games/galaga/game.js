import {
  BaseGame, drawShape,
} from './gamedoh-engine.js';
import {
  CANVAS_WIDTH, CANVAS_HEIGHT, BLOCK_SIZE,
  HUD_TOP_H, HUD_BOTTOM_H, HEART_BEAT, LIVES,
  TYPE_BOSS, TYPE_GOEI, TYPE_ZAKOZAKO,
  SCORE_ZAKOZAKO_FORM, SCORE_ZAKOZAKO_DIVE,
  SCORE_GOEI_FORM, SCORE_GOEI_DIVE,
  SCORE_BOSS_FORM, SCORE_BOSS_DIVE,
  SCORE_RESCUE_BONUS,
  TRACTOR_BEAM_W, TRACTOR_BEAM_FRAMES,
  INVINCIBLE_FRAMES, PLAYER_Y, FIGHTER_W, FIGHTER_H,
  ENEMY_BULLET_SPEED,
  LEVELS, CHALLENGING_WAVE_BONUS, CHALLENGING_PERFECT_BONUS, STAGE_CLEAR_DELAY,
} from './constants.js';
import Level from './level.js';
import Starfield from './starfield.js';
import Bullet from './bullet.js';
import Fighter from './fighter/index.js';
import { buildChallengeWave } from './enemy/index.js';
import { FORMATION, DIVING, TRACTOR, DEAD, ENTERING } from './enemy/states.js';
import { drawStartScreen, drawPauseOverlay, drawGameOverScreen, drawWinScreen, showLevelIntro, showCountdown, showBossIntro } from './screens.js';
import { playSound } from './sounds.js';

class Game extends BaseGame {
  constructor(ctx, opts) {
    super(ctx, opts, {
      canvasWidth:  CANVAS_WIDTH,
      canvasHeight: CANVAS_HEIGHT,
      blockSize:    BLOCK_SIZE,
      heartbeat:    HEART_BEAT,
      lives:        LIVES,
      initialSpeed: 1,
      maxSpeed:     1,
      speedUpEvery: 9999,
    });

    this.level     = new Level(this);
    this.starfield = new Starfield();

    this.enemies      = [];
    this.enemyBullets = [];
    this.fighter      = null;

    this._oscillationTick = 0;
    this._capturedShip    = null; // Enemy boss that has captured the player ship
    this._transitioning   = false;
    this._pendingLevelStart = false;

    // Challenging stage
    this._challenging        = false;
    this._challengeWaveIndex = 0;
    this._challengeWavesLeft = 0;
    this._challengeDestroyed = 0;
    this._challengeWaveSize  = 8;

    // High score (session)
    this._highScore = 0;

    // player_y exposed for enemy tractor state reference
    this.player_y = PLAYER_Y;

    this._keys = {};
  }

  _update() {
    if (this._transitioning) return;

    if (this._pendingLevelStart) {
      this._pendingLevelStart = false;
      this._startLevel();
      return;
    }

    // Starfield always scrolls
    this.starfield.update();
    this._oscillationTick++;

    if (!this.fighter) return;

    // Apply fighter movement from held keys
    if (this._keys['ArrowLeft'])       this.fighter.move(-1);
    else if (this._keys['ArrowRight']) this.fighter.move(1);
    else                               this.fighter.stopMoving();

    this.fighter.update();

    // Handle entry delay for enemies, then update
    for (const e of this.enemies) {
      if (e._entryDelayLeft > 0) {
        e._entryDelayLeft--;
        continue;
      }
      e.update(this._oscillationTick);
    }

    // Update enemy bullets
    this.enemyBullets.forEach(b => b.update());

    const cfg = this.level.config;

    if (!this._challenging) {
      // Dive trigger: pick enemies to dive if below max divers
      const divers = this.enemies.filter(
        e => e.state === DIVING || e.state === TRACTOR || e.state === ENTERING
      ).length;
      const maxDivers = cfg.maxDivers || 1;

      if (divers < maxDivers && Math.random() < 0.015) {
        const formationEnemies = this.enemies.filter(e => e.state === FORMATION && e.alive);
        if (formationEnemies.length > 0) {
          // Occasionally pick a Boss for tractor beam
          const bosses = formationEnemies.filter(e => e.type === TYPE_BOSS);
          if (bosses.length > 0 && Math.random() < 0.25 && !this._capturedShip) {
            const diver = bosses[Math.floor(Math.random() * bosses.length)];
            diver._tractorTargetX = this.fighter.x + FIGHTER_W / 2;
            diver.startTractor(diver._tractorTargetX);
          } else {
            const diver = formationEnemies[Math.floor(Math.random() * formationEnemies.length)];
            diver.startDive(this.fighter.x + FIGHTER_W / 2);
          }
        }
      }

      // Enemy fire: diving enemies occasionally shoot
      for (const e of this.enemies) {
        if (!e.alive) continue;
        if (e.state !== DIVING) continue;
        if (Math.random() < (cfg.fireRate || 0.002)) {
          this.enemyBullets.push(
            new Bullet(this, e.x, e.y + e.height / 2, ENEMY_BULLET_SPEED, 'enemy')
          );
          playSound('enemy_shoot');
        }
      }
    }

    // Tractor beam check: boss hovering emits beam toward player
    for (const e of this.enemies) {
      if (!e.alive || e.state !== TRACTOR) continue;
      const tractorState = e.currentState;
      if (!tractorState._hovering) continue;
      if (!this.fighter || this.fighter.state === 'DEAD') continue;

      const beamLeft  = e.x - TRACTOR_BEAM_W / 2;
      const beamRight = e.x + TRACTOR_BEAM_W / 2;
      const fx = this.fighter.x + FIGHTER_W / 2;

      if (fx >= beamLeft && fx <= beamRight && !this.fighter.flash.active) {
        e._tractorTimer = (e._tractorTimer || 0) + 1;
        if (e._tractorTimer % 15 === 0) playSound('tractor_pulse');
        if (e._tractorTimer >= TRACTOR_BEAM_FRAMES) {
          e._tractorTimer = 0;
          this._capturePlayer(e);
          // Force the tractor state to exit hover (timeout)
          tractorState._hoverTimer = 200;
        }
      } else {
        e._tractorTimer = Math.max(0, (e._tractorTimer || 0) - 1);
      }
    }

    // Collision: player bullets × enemies
    for (const bullet of this.fighter.bullets) {
      if (!bullet.alive) continue;
      for (const e of this.enemies) {
        if (!e.alive || e.state === DEAD) continue;
        const eBox = {
          x: e.x - e.width / 2,
          y: e.y - e.height / 2,
          width: e.width,
          height: e.height,
        };
        if (this._overlap(bullet, eBox)) {
          bullet.alive = false;
          const killed = e.hit();
          if (this.shake) this.shake.trigger();
          if (killed) {
            const isDiving = e.state !== FORMATION;
            const pts = this._scoreFor(e.type, isDiving);
            this.addScore(pts);
            playSound(e.type === TYPE_BOSS ? 'explode_boss' : 'explode_small');
            if (e.type === TYPE_BOSS && e._capturedShip) {
              this._rescueCaptured();
            }
            if (e.type === TYPE_BOSS && this._capturedShip === e) {
              this._capturedShip = null;
            }
          }
          break;
        }
      }
    }

    // Collision: enemy bullets × fighter
    if (this.fighter && this.fighter.state !== 'DEAD' && !this.fighter.flash.active) {
      for (const b of this.enemyBullets) {
        if (!b.alive) continue;
        const fBox = { x: this.fighter.x, y: this.fighter.y, width: FIGHTER_W, height: FIGHTER_H };
        if (this._overlap(b, fBox)) {
          b.alive = false;
          this.fighter.die();
          break;
        }
      }
    }

    // Collision: diving enemies × fighter (body contact)
    if (this.fighter && this.fighter.state !== 'DEAD' && !this.fighter.flash.active) {
      for (const e of this.enemies) {
        if (!e.alive || e.state === FORMATION || e.state === ENTERING || e.state === DEAD) continue;
        const eBox = {
          x: e.x - e.width / 2 + 4,
          y: e.y - e.height / 2 + 4,
          width: e.width - 8,
          height: e.height - 8,
        };
        const fBox = {
          x: this.fighter.x + 4,
          y: this.fighter.y + 4,
          width: FIGHTER_W - 8,
          height: FIGHTER_H - 8,
        };
        if (this._overlap(eBox, fBox)) {
          this.fighter.die();
          break;
        }
      }
    }

    // Prune dead entities
    this.enemies = this.enemies.filter(e => e.alive);
    this.enemyBullets = this.enemyBullets.filter(b => b.alive);

    // Check stage completion
    if (this._challenging) {
      if (this.enemies.length === 0 && !this._transitioning) {
        this._challengeDestroyed += this._challengeWaveSize;
        this.addScore(CHALLENGING_WAVE_BONUS);
        this._challengeWavesLeft--;
        if (this._challengeWavesLeft <= 0) {
          // All waves done
          if (this._challengeDestroyed >= 40) this.addScore(CHALLENGING_PERFECT_BONUS);
          playSound('stage_clear');
          this._transitioning = true;
          setTimeout(() => {
            this._transitioning = false;
            this.level.advance();
          }, 2000);
        } else {
          this._challengeWaveIndex++;
          this._transitioning = true;
          setTimeout(() => {
            this._transitioning = false;
            const wave = buildChallengeWave(this, this._challengeWaveIndex);
            this.enemies = wave;
          }, 1000);
        }
      }
    } else {
      // Normal stage: win when all enemies dead
      if (this.enemies.length === 0 && !this._transitioning) {
        playSound('stage_clear');
        this._transitioning = true;
        setTimeout(() => {
          this._transitioning = false;
          this.level.advance();
        }, STAGE_CLEAR_DELAY);
      }
    }
  }

  _overlap(a, b) {
    return (
      a.x < b.x + b.width &&
      a.x + a.width > b.x &&
      a.y < b.y + b.height &&
      a.y + a.height > b.y
    );
  }

  _scoreFor(type, diving) {
    if (type === TYPE_BOSS) return diving ? SCORE_BOSS_DIVE : SCORE_BOSS_FORM;
    if (type === TYPE_GOEI) return diving ? SCORE_GOEI_DIVE : SCORE_GOEI_FORM;
    return diving ? SCORE_ZAKOZAKO_DIVE : SCORE_ZAKOZAKO_FORM;
  }

  _capturePlayer(boss) {
    if (!this.fighter || this.fighter.state === 'DEAD') return;
    if (this.fighter.dual) {
      // Destroy one ship of dual fighter
      this.fighter.dual = false;
      return;
    }
    boss._capturedShip = true;
    this._capturedShip = boss;
    playSound('capture');
    this.fighter.die();
    // loseLife() will be called by DeadState when animation completes
  }

  _rescueCaptured() {
    this._capturedShip = null;
    if (this.fighter) {
      this.fighter.dual = true;
      this.addScore(SCORE_RESCUE_BONUS);
      playSound('dual');
    }
  }

  async _startLevel() {
    this._transitioning = true;
    const cfg = this.level.config;

    if (cfg.boss) {
      await showBossIntro(this);
      await showCountdown(this);
      this._challenging = false;
    } else if (cfg.challenging) {
      this._challenging        = true;
      this._challengeWaveIndex = 0;
      this._challengeWavesLeft = 5;
      this._challengeDestroyed = 0;
      playSound('challenge_start');
      await showLevelIntro(this, 'CHALLENGING STAGE');
      await showCountdown(this);
      // Spawn first wave
      const wave = buildChallengeWave(this, 0);
      this.enemies = wave;
    } else {
      const isFirstLevel = this.level.index === 0;
      await showLevelIntro(this, this.level.index + 1, isFirstLevel ? 800 : 2000);
      if (!isFirstLevel) await showCountdown(this);
      this._challenging = false;
    }

    this._transitioning = false;
  }

  loseLife() {
    super.loseLife();
    if (this.lives > 0) {
      this.fighter = new Fighter(this);
      this.fighter.flash.trigger(INVINCIBLE_FRAMES);
      this.enemyBullets = [];
    }
  }

  win() {
    super.win();
  }

  _drawWorld() {
    const { ctx } = this;

    // Black background
    ctx.save();
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx.restore();

    // Starfield
    this.starfield.draw(ctx);

    // Enemies
    for (const e of this.enemies) {
      if (e._entryDelayLeft > 0) continue;
      e.draw(ctx);

      // Tractor beam visual
      if (e.state === TRACTOR && e.currentState._hovering) {
        ctx.save();
        const beamH = PLAYER_Y - e.y + FIGHTER_H;
        ctx.globalAlpha = 0.3 + 0.2 * Math.sin(this._oscillationTick * 0.3);
        ctx.fillStyle = '#00ff44';
        ctx.fillRect(
          Math.floor(e.x - TRACTOR_BEAM_W / 2),
          Math.floor(e.y + e.height / 2),
          TRACTOR_BEAM_W,
          Math.max(0, beamH)
        );
        ctx.restore();
      }

      // Captured ship icon drawn near boss
      if (e._capturedShip && this._capturedShip === e) {
        ctx.save();
        ctx.fillStyle = '#ff6666';
        ctx.fillRect(Math.floor(e.x - 14), Math.floor(e.y + e.height / 2 + 4), 28, 12);
        ctx.restore();
      }
    }

    // Fighter
    if (this.fighter) this.fighter.draw(ctx);

    // Enemy bullets
    this.enemyBullets.forEach(b => b.draw(ctx));

    // Challenging stage banner
    if (this._challenging) {
      ctx.save();
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = 'rgba(255,255,0,0.7)';
      ctx.font = 'bold 13px monospace';
      ctx.fillText('CHALLENGING STAGE', CANVAS_WIDTH / 2, HUD_TOP_H + 10);
      ctx.restore();
    }
  }

  drawHUD() {
    if (this._transitioning) return;
    const { ctx } = this;
    ctx.save();

    // Top bar background
    ctx.fillStyle = '#111111';
    ctx.fillRect(0, 0, CANVAS_WIDTH, HUD_TOP_H);

    ctx.textBaseline = 'middle';
    const midY = HUD_TOP_H / 2;

    // Score (left)
    ctx.fillStyle = '#ffffff';
    ctx.font = '12px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('1ST PLAYER', 8, midY - 7);
    ctx.fillStyle = '#00ffff';
    ctx.font = 'bold 14px monospace';
    ctx.fillText(String(this.score).padStart(6, '0'), 8, midY + 8);

    // High score (center)
    if (this.score > this._highScore) this._highScore = this.score;
    ctx.fillStyle = '#ffffff';
    ctx.font = '12px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('HIGH SCORE', CANVAS_WIDTH / 2, midY - 7);
    ctx.fillStyle = '#ffff00';
    ctx.font = 'bold 14px monospace';
    ctx.fillText(String(this._highScore).padStart(6, '0'), CANVAS_WIDTH / 2, midY + 8);

    // Stage (right)
    ctx.fillStyle = '#ffffff';
    ctx.font = '12px monospace';
    ctx.textAlign = 'right';
    ctx.fillText('STAGE', CANVAS_WIDTH - 8, midY - 7);
    ctx.fillStyle = '#ff9800';
    ctx.font = 'bold 14px monospace';
    ctx.fillText(String(this.level.index + 1).padStart(2, '0'), CANVAS_WIDTH - 8, midY + 8);

    // Top bar divider
    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, HUD_TOP_H);
    ctx.lineTo(CANVAS_WIDTH, HUD_TOP_H);
    ctx.stroke();

    // Bottom bar background
    const bottomY = CANVAS_HEIGHT - HUD_BOTTOM_H;
    ctx.fillStyle = '#111111';
    ctx.fillRect(0, bottomY, CANVAS_WIDTH, HUD_BOTTOM_H);

    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.beginPath();
    ctx.moveTo(0, bottomY);
    ctx.lineTo(CANVAS_WIDTH, bottomY);
    ctx.stroke();

    // Lives (miniature fighter icons)
    ctx.fillStyle = '#00ccff';
    ctx.font = '20px monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    const liveMidY = bottomY + HUD_BOTTOM_H / 2;
    for (let i = 0; i < Math.max(0, this.lives - 1); i++) {
      ctx.fillText('\u25b2', 8 + i * 22, liveMidY);
    }

    // Stage badges (dots, right side)
    ctx.fillStyle = '#ff9800';
    for (let i = 0; i <= this.level.index; i++) {
      ctx.beginPath();
      ctx.arc(CANVAS_WIDTH - 12 - i * 14, liveMidY, 4, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  drawStartScreen()    { drawStartScreen(this.ctx, this.startButton); }
  drawPauseOverlay()   { drawPauseOverlay(this.ctx); }
  drawGameOverScreen() { drawGameOverScreen(this.ctx, this.score, this.restartButton); }
  drawWinScreen()      { drawWinScreen(this.ctx, this.score, this.restartButton); }
}

export default Game;
