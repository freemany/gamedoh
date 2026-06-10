import {
  CANVAS_WIDTH, CANVAS_HEIGHT, HEART_BEAT, GAME_STATE,
  GROUND_Y, FIGHTER_BLOCK_SIZE,
  PUNCH, KICK, JUMP_PUNCH, JUMP_KICK,
  PUNCH_DAMAGE, KICK_DAMAGE, JUMP_PUNCH_DAMAGE, JUMP_KICK_DAMAGE,
  PLATFORMS,
  STAGE_CLEAR_DELAY, KO_DISPLAY_MS,
  MAX_ENEMIES_ON_SCREEN, ENEMY_SPAWN_DELAY_TICKS,
  LEVELS, PLAYER_LIVES, COMBO_TIMEOUT_TICKS,
  ENEMY_TYPES,
  POWERUP_HEAL, POWERUP_STAR_TICKS, POWERUP_SHIELD_TICKS,
} from './constants.js';
import Fighter  from './fighter/index.js';
import Enemy    from './enemy/index.js';
import PowerUp  from './powerup.js';
import Level    from './level.js';
import InputHandler from './inputHandler.js';
import { showLevelIntro, showCountdown } from './screens.js';
import { playSound } from './sounds.js';

function rectsOverlap(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x
      && a.y < b.y + b.h && a.y + a.h > b.y;
}

class Game {
  constructor(ctx) {
    this.ctx   = ctx;
    this.state = GAME_STATE.START;
    this.tick  = 0;
  }

  init() {
    this.level   = new Level(this);
    this.fighter = new Fighter(this);
    this.enemies  = [];
    this.powerups = [];

    this._spawnTimer     = 0;
    this._enemiesSpawned = 0;
    this._transitioning  = false;
    this.overlayRenderer = null;
    this._outcome        = null;
    this._clashSpark     = null;

    this._shake        = 0;
    this._combo        = 0;
    this._comboTimer   = 0;
    this.score         = 0;
    this.hiScore       = parseInt(localStorage.getItem('sf_hiscore') || '0');
    this.lives         = PLAYER_LIVES;
    this._starTicks    = 0;
    this._shieldTicks  = 0;

    this.inputHandler = new InputHandler();

    this.onLevelAdvance = () => {
      this.enemies  = [];
      this.powerups = [];
      this._spawnTimer     = 0;
      this._enemiesSpawned = 0;
      this.fighter.health  = this.fighter.maxHealth;
      this._startLevel();
    };

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        if (this.state === GAME_STATE.START) {
          this.state = GAME_STATE.PLAYING;
          this._startLevel();
        } else if (this.state === GAME_STATE.OVER) {
          this._resetGame();
        }
      }
    });

    this.run();
  }

  async _startLevel() {
    this._transitioning = true;
    await showLevelIntro(this, this.level.index + 1);
    if (this.level.index > 0) await showCountdown(this);
    this._transitioning = false;
  }

  _saveHiScore() {
    this.hiScore = Math.max(this.hiScore, this.score);
    localStorage.setItem('sf_hiscore', this.hiScore);
  }

  win()  { this._saveHiScore(); this._outcome = 'WIN';  this.state = GAME_STATE.OVER; }
  lose() { this._saveHiScore(); this._outcome = 'LOSE'; this.state = GAME_STATE.OVER; }

  _resetGame() {
    this.level   = new Level(this);
    this.fighter = new Fighter(this);
    this.enemies  = [];
    this.powerups = [];

    this._spawnTimer     = 0;
    this._enemiesSpawned = 0;
    this._transitioning  = false;
    this.overlayRenderer = null;
    this._outcome        = null;
    this._clashSpark     = null;
    this._shake          = 0;
    this._combo          = 0;
    this._comboTimer     = 0;
    this.score           = 0;
    this.lives           = PLAYER_LIVES;
    this._starTicks      = 0;
    this._shieldTicks    = 0;
    // Fighter fatigue resets automatically via new Fighter(this)

    this.state = GAME_STATE.PLAYING;
    this._startLevel();
  }

  async _showKO() {
    this._transitioning = true;
    this.fighter.health = this.fighter.maxHealth;
    this._combo = 0;

    await new Promise(resolve => {
      this.overlayRenderer = () => {
        const { ctx } = this;
        const cx = CANVAS_WIDTH / 2, cy = CANVAS_HEIGHT / 2;
        ctx.save();
        ctx.fillStyle = 'rgba(0,0,0,0.75)';
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        ctx.fillStyle = '#ff4444';
        ctx.font = 'bold 120px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('KO!', cx, cy - 30);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 22px monospace';
        ctx.fillText(`${this.lives} ${this.lives === 1 ? 'life' : 'lives'} remaining`, cx, cy + 60);
        ctx.restore();
      };
      setTimeout(() => { this.overlayRenderer = null; resolve(); }, KO_DISPLAY_MS);
    });

    this._transitioning = false;
  }

  // Called by EnemyDeadState to drop a power-up
  spawnPowerup(x) {
    this.powerups.push(new PowerUp(x));
  }

  _spawnEnemies() {
    const cfg      = this.level.config;
    const onScreen = this.enemies.filter(e => !e.markedForRemoval).length;
    if (this._enemiesSpawned < cfg.enemyCount && onScreen < MAX_ENEMIES_ON_SCREEN) {
      if (++this._spawnTimer >= ENEMY_SPAWN_DELAY_TICKS) {
        this._spawnTimer = 0;
        const typeName = cfg.enemyTypes?.[this._enemiesSpawned] ?? 'grunt';
        const typeDef  = ENEMY_TYPES[typeName] ?? ENEMY_TYPES.grunt;
        // Grunts alternate red/blue; other types use their defined color
        const color = typeDef.color ?? (this._enemiesSpawned % 2 === 0 ? 'r' : 'b');
        this.enemies.push(new Enemy(this, color, typeName));
        this._enemiesSpawned++;
      }
    }
  }

  _checkPowerups() {
    const pBox = this.fighter.getHurtbox();
    for (const p of this.powerups) {
      if (p.collected) continue;
      if (rectsOverlap(pBox, p.getBox())) {
        p.collected = true;
        playSound('powerup');
        if (p.type === 'heart') {
          this.fighter.health = Math.min(this.fighter.maxHealth, this.fighter.health + POWERUP_HEAL);
        } else if (p.type === 'star') {
          this._starTicks = POWERUP_STAR_TICKS;
        } else if (p.type === 'shield') {
          this._shieldTicks = POWERUP_SHIELD_TICKS;
        }
      }
    }
    this.powerups = this.powerups.filter(p => !p.collected);
  }

  _checkCombat() {
    const pState     = this.fighter.currentState.state;
    const pAttacking = pState === PUNCH || pState === KICK || pState === JUMP_PUNCH || pState === JUMP_KICK;

    // Clash — both attacking and close → cancel both, no damage
    if (pAttacking) {
      for (const e of this.enemies) {
        const es = e.currentState.state;
        if (es !== PUNCH && es !== KICK) continue;
        const absDx = Math.abs(this.fighter.x - e.x);
        if (absDx <= 45) {
          this.fighter.enterState('IDLE');
          e.enterState('IDLE');
          this._clashSpark = {
            x: ((this.fighter.x + e.x) / 2 + 25) * 2,
            y: (this.fighter.y + 10) * 2,
            ticks: 8, color: '#ffff00',
          };
          playSound('clash');
          return;
        }
      }
    }

    // Player attacks enemies
    if (pAttacking) {
      const hitbox    = this.fighter.getHitbox(pState);
      const baseDmg   = pState === PUNCH ? PUNCH_DAMAGE
                      : pState === KICK  ? KICK_DAMAGE
                      : pState === JUMP_PUNCH ? JUMP_PUNCH_DAMAGE
                      : JUMP_KICK_DAMAGE;
      const starMult  = this._starTicks > 0 ? 2 : 1;
      const knockDir  = this.fighter.facingRight ? 1 : -1;

      for (const e of this.enemies) {
        if (e.markedForRemoval) continue;
        if (rectsOverlap(hitbox, e.getHurtbox())) {
          const dmg = Math.round(baseDmg * starMult);
          e.receiveHit(dmg, knockDir);
          this._combo++;
          this._comboTimer = COMBO_TIMEOUT_TICKS;
          this.score += dmg * Math.max(1, Math.floor(this._combo / 2));
          this._clashSpark = {
            x: (e.x + 25) * FIGHTER_BLOCK_SIZE,
            y: (e.y + 15) * FIGHTER_BLOCK_SIZE,
            ticks: 8, color: '#ffff00',
          };
        }
      }
    }

    // Enemies attack player
    for (const e of this.enemies) {
      const es = e.currentState.state;
      if (es !== PUNCH && es !== KICK) continue;
      if (this._shieldTicks > 0) continue; // shield blocks all hits
      const baseDmg  = es === PUNCH ? PUNCH_DAMAGE : KICK_DAMAGE;
      const dmg      = Math.round(baseDmg * e._damageMult);
      const knockDir = e.facingRight ? 1 : -1;
      if (rectsOverlap(e.getHitbox(es), this.fighter.getHurtbox())) {
        this.fighter.receiveHit(dmg, es, knockDir);
        this._combo = 0;
        this._shake = 4;
        this._clashSpark = {
          x: (this.fighter.x + 25) * FIGHTER_BLOCK_SIZE,
          y: (this.fighter.y + 15) * FIGHTER_BLOCK_SIZE,
          ticks: 8, color: '#ff8800',
        };
      }
    }
  }

  _checkStageComplete() {
    if (this._transitioning) return;
    const cfg = this.level.config;
    if (this._enemiesSpawned >= cfg.enemyCount && this.enemies.length === 0) {
      this._transitioning = true;
      setTimeout(() => {
        this._transitioning = false;
        this.level.advance();
      }, STAGE_CLEAR_DELAY);
    }
  }

  _checkPlayerDeath() {
    if (this.fighter.health <= 0) {
      if (this.lives > 1) {
        this.lives--;
        this._showKO();
      } else {
        this.lose();
      }
    }
  }

  // ─── Background ────────────────────────────────────────────────────────────

  drawBackground() {
    const { ctx } = this;
    const gY = GROUND_Y * FIGHTER_BLOCK_SIZE; // 500px — the ground line

    // ── Sky ─────────────────────────────────────────────────────────────────
    const sky = ctx.createLinearGradient(0, 0, 0, gY);
    sky.addColorStop(0,   '#130f28');
    sky.addColorStop(0.4, '#1e1d42');
    sky.addColorStop(1,   '#2a3060');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, CANVAS_WIDTH, gY);

    // Stars
    for (let i = 0; i < 100; i++) {
      const sx  = Math.abs(Math.sin(i * 127.3 + 1)) * CANVAS_WIDTH;
      const sy  = Math.abs(Math.sin(i * 311.7 + 2)) * gY * 0.6;
      const big = Math.abs(Math.sin(i * 73.1)) > 0.85;
      ctx.globalAlpha = 0.35 + Math.abs(Math.sin(i * 53.3)) * 0.55;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(Math.floor(sx), Math.floor(sy), big ? 2 : 1, big ? 2 : 1);
    }
    ctx.globalAlpha = 1;

    // ── Far layer — tall teal skyscrapers ────────────────────────────────────
    const farBuilds = [
      [0,50,340],[55,35,310],[95,65,390],[170,28,260],[205,45,330],
      [260,70,370],[345,30,270],[385,75,410],[475,40,300],[525,55,350],
      [590,38,285],[638,68,365],[720,50,320],[780,60,355],[850,42,285],
      [905,80,400],[1000,45,310],[1058,62,345],[1135,48,295],[1190,55,330],
    ];
    ctx.fillStyle = '#162538';
    farBuilds.forEach(([x, w, h]) => ctx.fillRect(x, gY - h, w, h));

    // Antennas on some far buildings
    ctx.fillStyle = '#0e1a28';
    farBuilds.forEach(([x, w, h], i) => {
      if (i % 3 === 0) ctx.fillRect(x + Math.floor(w / 2), gY - h - 18, 2, 18);
    });

    // Far windows — teal/cyan, tiny
    farBuilds.forEach(([x, w, h], i) => {
      for (let r = 0; r < 10; r++) {
        for (let c = 0; c < 3; c++) {
          if (Math.sin(i * 17 + r * 7 + c * 13) > 0.55) {
            ctx.globalAlpha = 0.5;
            ctx.fillStyle = Math.sin(i + r) > 0 ? '#3dcfb0' : '#5ab8d8';
            ctx.fillRect(x + 5 + c * Math.floor(w / 3), gY - h + 15 + r * 32, 4, 6);
          }
        }
      }
    });
    ctx.globalAlpha = 1;

    // ── Mid layer — medium blue-grey buildings ────────────────────────────────
    const midBuilds = [
      [0,110,220],[120,90,200],[220,130,240],[360,95,215],
      [465,120,235],[595,100,210],[705,135,245],[850,105,220],
      [965,125,230],[1100,110,215],
    ];
    ctx.fillStyle = '#1c2238';
    midBuilds.forEach(([x, w, h]) => ctx.fillRect(x, gY - h, w, h));

    // Mid windows — warm amber, small
    midBuilds.forEach(([x, w, h], i) => {
      const cols = Math.floor(w / 28);
      const rows = Math.floor((h - 20) / 34);
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          if (Math.sin(i * 23 + r * 11 + c * 7) > 0.1) {
            ctx.fillStyle = Math.sin(i + r * 3 + c * 2) > 0.2 ? '#d07030' : '#c06020';
            ctx.globalAlpha = 0.75;
            ctx.fillRect(x + 10 + c * 28, gY - h + 14 + r * 34, 10, 14);
          }
        }
      }
    });
    ctx.globalAlpha = 1;

    // ── Front layer — detailed buildings with warm windows ────────────────────
    const frontBuilds = [
      { x: 0,    w: 175, h: 180 },
      { x: 185,  w: 210, h: 210 },
      { x: 405,  w: 145, h: 165 },
      { x: 560,  w: 190, h: 195 },
      { x: 760,  w: 170, h: 175 },
      { x: 940,  w: 205, h: 200 },
      { x: 1155, w: 145, h: 170 },
    ];

    // Building base
    frontBuilds.forEach(({ x, w, h }) => {
      ctx.fillStyle = '#17121e';
      ctx.fillRect(x, gY - h, w, h);
      // Roof trim
      ctx.fillStyle = '#221a2c';
      ctx.fillRect(x, gY - h, w, 10);
      // Subtle brick texture lines
      ctx.fillStyle = '#1c1626';
      for (let ly = gY - h + 20; ly < gY; ly += 18) {
        ctx.fillRect(x, ly, w, 1);
      }
    });

    // Warm amber windows — large, glowing
    frontBuilds.forEach(({ x, w, h }, bi) => {
      const wW = 18, wH = 22;
      const cols = Math.max(2, Math.floor((w - 24) / 30));
      const rows = Math.max(2, Math.floor((h - 30) / 36));
      const padX = (w - cols * 30) / 2;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const wx = x + padX + c * 30;
          const wy = gY - h + 20 + r * 36;
          const lit = Math.sin(bi * 19 + r * 11 + c * 7) > -0.25;
          if (lit) {
            // Glow halo
            ctx.fillStyle = '#ff8830';
            ctx.globalAlpha = 0.18;
            ctx.fillRect(wx - 3, wy - 3, wW + 6, wH + 6);
            ctx.globalAlpha = 1;
            // Window pane
            ctx.fillStyle = Math.sin(bi + r * 5 + c * 3) > 0.3 ? '#ffcc55' : '#ff9940';
            ctx.fillRect(wx, wy, wW, wH);
            // Window cross-bar
            ctx.fillStyle = '#cc6820';
            ctx.fillRect(wx, wy + Math.floor(wH / 2), wW, 1);
            ctx.fillRect(wx + Math.floor(wW / 2), wy, 1, wH);
          } else {
            ctx.fillStyle = '#0c0810';
            ctx.fillRect(wx, wy, wW, wH);
          }
        }
      }
    });
    ctx.globalAlpha = 1;

    // ── Ground ───────────────────────────────────────────────────────────────
    ctx.fillStyle = '#100c18';
    ctx.fillRect(0, gY, CANVAS_WIDTH, CANVAS_HEIGHT - gY);
    // Pavement edge highlight
    ctx.fillStyle = '#1e1828';
    ctx.fillRect(0, gY, CANVAS_WIDTH, 5);
  }

  // ─── HUD ───────────────────────────────────────────────────────────────────

  _drawHealthBar(x, y, width, health, maxHealth, label, align) {
    const { ctx } = this;
    const pct   = Math.max(0, health / maxHealth);
    const fillW = Math.floor(width * pct);

    ctx.fillStyle = '#222'; ctx.fillRect(x, y, width, 20);
    ctx.fillStyle = pct > 0.5 ? '#44ff44' : pct > 0.25 ? '#ffcc00' : '#ff4444';
    ctx.fillRect(x, y, fillW, 20);
    ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 2; ctx.strokeRect(x, y, width, 20);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 13px monospace';
    ctx.textBaseline = 'bottom';
    ctx.textAlign = align;
    ctx.fillText(label, align === 'left' ? x : x + width, y - 2);
  }

  drawHUD() {
    const { ctx } = this;
    ctx.save();

    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, 60);

    // Lives — hearts top-left
    ctx.font = 'bold 16px monospace';
    ctx.textBaseline = 'top'; ctx.textAlign = 'left';
    for (let i = 0; i < PLAYER_LIVES; i++) {
      ctx.fillStyle = i < this.lives ? '#ff4444' : '#444';
      ctx.fillText('♥', 16 + i * 22, 4);
    }

    // Quick control reminder next to hearts
    ctx.fillStyle = '#888888';
    ctx.font = '11px monospace';
    ctx.fillText('← → move   ↑ jump   ↓ crouch   Z punch   X kick', 82, 6);

    // Player health bar
    this._drawHealthBar(16, 28, 280, this.fighter.health, this.fighter.maxHealth, 'PLAYER', 'left');

    // Active power-up indicators
    let indicatorX = 310;
    if (this._starTicks > 0) {
      ctx.font = 'bold 12px monospace'; ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
      ctx.fillStyle = '#ffff00'; ctx.fillText('★ PWR', indicatorX, 38); indicatorX += 64;
    }
    if (this._shieldTicks > 0) {
      ctx.font = 'bold 12px monospace'; ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
      ctx.fillStyle = '#44aaff'; ctx.fillText('⬡ DEF', indicatorX, 38);
    }

    // Center — score + stage
    ctx.textAlign = 'center'; ctx.textBaseline = 'top';
    ctx.fillStyle = '#ffcc00'; ctx.font = 'bold 13px monospace';
    ctx.fillText(`SCORE  ${this.score}`, CANVAS_WIDTH / 2, 4);
    ctx.fillStyle = '#aaaaaa'; ctx.font = '11px monospace';
    ctx.fillText(`HI  ${this.hiScore}`, CANVAS_WIDTH / 2, 20);
    ctx.fillStyle = '#ffcc00'; ctx.font = 'bold 14px monospace';
    ctx.textBaseline = 'middle';
    ctx.fillText(`STAGE  ${this.level.index + 1} / ${LEVELS.length}`, CANVAS_WIDTH / 2, 46);

    // Enemy health bar — show first live enemy with its type label
    const liveEnemies = this.enemies.filter(e => !e.markedForRemoval);
    if (liveEnemies.length > 0) {
      const e = liveEnemies[0];
      this._drawHealthBar(CANVAS_WIDTH - 296, 28, 280, e.health, e.maxHealth, e.label ?? 'ENEMY', 'right');
    }

    ctx.restore();
  }

  _drawCombo() {
    if (this._combo < 2) return;
    const { ctx } = this;
    const bs   = FIGHTER_BLOCK_SIZE;
    const px   = this.fighter.x * bs + 60;
    const py   = this.fighter.y * bs - 10;
    const size = Math.min(48, 18 + this._combo * 2);
    ctx.save();
    ctx.font = `bold ${size}px monospace`;
    ctx.textAlign = 'left'; ctx.textBaseline = 'bottom';
    ctx.fillStyle = '#ff8800'; ctx.fillText(`${this._combo} HIT!`, px + 2, py + 2);
    ctx.fillStyle = '#ffff00'; ctx.fillText(`${this._combo} HIT!`, px, py);
    ctx.restore();
  }

  _drawFatigue() {
    if (!this.fighter._fatigued) return;
    const { ctx } = this;
    const bs       = FIGHTER_BLOCK_SIZE;
    const tick     = this.fighter._fatigueAnimTick;
    const bubbled  = tick >= 3; // after ~300ms, bubble up
    const fontSize = bubbled ? 36 : 20;
    const drift    = tick * 3; // px drifting backward each tick
    const backDir  = this.fighter.facingRight ? -1 : 1;
    const px       = this.fighter.x * bs - 20 + backDir * drift;
    const py       = this.fighter.y * bs - (bubbled ? 90 : 50);
    ctx.save();
    ctx.font = `bold ${fontSize}px monospace`;
    ctx.textAlign = 'left'; ctx.textBaseline = 'bottom';
    ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 4; ctx.lineJoin = 'round';
    ctx.strokeText('REST, STEP BACK', px, py);
    ctx.fillStyle = '#aa0000'; ctx.fillText('REST, STEP BACK', px + 2, py + 2);
    ctx.fillStyle = '#ff0000'; ctx.fillText('REST, STEP BACK', px, py);
    ctx.restore();
  }

  // ─── Start Screen ──────────────────────────────────────────────────────────

  drawStartScreen() {
    const { ctx } = this;
    const cx = CANVAS_WIDTH / 2;

    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,0.80)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Title
    ctx.fillStyle = '#ff4444';
    ctx.font = 'bold 64px monospace';
    ctx.textAlign = 'center'; ctx.textBaseline = 'top';
    ctx.fillText('STREET FIGHTERS', cx, 18);

    ctx.fillStyle = '#ffcc00';
    ctx.font = '18px monospace';
    ctx.fillText('Defeat all enemies across 3 stages to win — 3 lives total', cx, 96);

    // ── Left panel: Controls ──────────────────────────────────────────────
    const lx = 50, bY = 130, bH = 300;
    const lW = 490, rX = 660, rW = 490;

    ctx.fillStyle = 'rgba(255,255,255,0.05)';
    ctx.fillRect(lx, bY, lW, bH);

    ctx.fillStyle = '#ff4444'; ctx.font = 'bold 15px monospace';
    ctx.textAlign = 'left'; ctx.textBaseline = 'top';
    ctx.fillText('CONTROLS', lx + 18, bY + 14);

    const controls = [
      ['← →',            'Move left / right'],
      ['↑  or  Space',   'Jump  (dodges kicks)'],
      ['↓',              'Crouch  (blocks punches — chip damage only)'],
      ['Z',              'Punch  —  mid-height, 15 dmg'],
      ['X',              'Kick   —  low sweep, 20 dmg'],
      ['Jump + Z',       'Air Punch  —  20 dmg  (more range)'],
      ['Jump + X',       'Air Kick   —  25 dmg  (most damage)'],
    ];
    ctx.font = '14px monospace';
    controls.forEach(([key, desc], i) => {
      const y = bY + 46 + i * 35;
      ctx.fillStyle = '#ffcc00'; ctx.fillText(key, lx + 18, y);
      ctx.fillStyle = '#cccccc'; ctx.fillText(desc, lx + 160, y);
    });

    // ── Right panel: How to Fight + How to Win ────────────────────────────
    ctx.fillStyle = 'rgba(255,255,255,0.05)';
    ctx.fillRect(rX, bY, rW, bH);

    ctx.fillStyle = '#44aaff'; ctx.font = 'bold 15px monospace';
    ctx.fillText('HOW TO FIGHT', rX + 18, bY + 14);

    const tips = [
      ['CROUCH  vs  PUNCH', 'block — take only 3 chip dmg instead of 15'],
      ['JUMP    vs  KICK',  'dodge — kick passes under you completely'],
      ['HIT COMBO',         'each consecutive hit multiplies score'],
      ['CLASH',             'attack while enemy attacks → both cancel'],
    ];
    ctx.font = '14px monospace';
    tips.forEach(([key, desc], i) => {
      const y = bY + 46 + i * 32;
      ctx.fillStyle = '#ffcc00'; ctx.fillText(key, rX + 18, y);
      ctx.fillStyle = '#cccccc'; ctx.fillText(desc, rX + 18, y + 16);
    });

    // Power-ups sub-section
    const puY = bY + 46 + tips.length * 32 + 10;
    ctx.fillStyle = '#44aaff'; ctx.font = 'bold 14px monospace';
    ctx.fillText('FLOOR DROPS  (30% on kill)', rX + 18, puY);
    ctx.font = '14px monospace';
    [
      ['♥  HEAL',   '+25 HP instantly'],
      ['★  POWER',  '2× damage for 5 seconds'],
      ['⬡  SHIELD', 'full invincibility for 3 seconds'],
    ].forEach(([icon, desc], i) => {
      const y = puY + 20 + i * 22;
      ctx.fillStyle = ['#ff4444','#ffff00','#44aaff'][i];
      ctx.fillText(icon, rX + 18, y);
      ctx.fillStyle = '#cccccc';
      ctx.fillText(desc, rX + 130, y);
    });

    // Enemy types sub-section
    const etY = puY + 20 + 3 * 22 + 10;
    ctx.fillStyle = '#44aaff'; ctx.font = 'bold 14px monospace';
    ctx.fillText('ENEMY TYPES', rX + 18, etY);
    ctx.font = '13px monospace';
    [
      { color: '#ff4444', label: 'GRUNT  (red/blue)', desc: 'Stage 1–3 · standard AI' },
      { color: 'green',   label: 'BRAWLER (green)',   desc: 'Stage 2–3 · 2.5× HP, 2× dmg, slow' },
      { color: '#cccc00', label: 'RUSHER  (yellow)',  desc: 'Stage 3   · 2× speed, 0.4× HP, fast' },
    ].forEach(({ color, label, desc }, i) => {
      const y = etY + 18 + i * 22;
      ctx.fillStyle = color; ctx.fillText(`■ ${label}`, rX + 18, y);
      ctx.fillStyle = '#aaaaaa'; ctx.fillText(desc, rX + 220, y);
    });

    // Press ENTER
    if (Math.floor(this.tick / 5) % 2 === 0) {
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 22px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('Press  ENTER  to play', cx, 502);
    }

    ctx.restore();
  }

  // ─── Game Over ─────────────────────────────────────────────────────────────

  drawGameOver() {
    const { ctx } = this;
    const cx = CANVAS_WIDTH / 2, cy = CANVAS_HEIGHT / 2;
    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,0.80)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    const isWin = this._outcome === 'WIN';
    ctx.fillStyle = isWin ? '#44ff44' : '#ff4444';
    ctx.font = 'bold 90px monospace';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(isWin ? 'YOU WIN!' : 'GAME OVER', cx, cy - 70);

    ctx.fillStyle = '#ffcc00'; ctx.font = 'bold 28px monospace';
    ctx.fillText(`SCORE  ${this.score}`, cx, cy + 10);
    ctx.fillStyle = '#aaaaaa'; ctx.font = '20px monospace';
    ctx.fillText(`HI-SCORE  ${this.hiScore}`, cx, cy + 44);

    if (Math.floor(this.tick / 5) % 2 === 0) {
      ctx.fillStyle = '#ffffff'; ctx.font = 'bold 22px monospace';
      ctx.fillText('Press ENTER to play again', cx, cy + 90);
    }
    ctx.restore();
  }

  _drawClashSpark() {
    if (!this._clashSpark) return;
    const { ctx, _clashSpark: s } = this;
    const progress = s.ticks / 8;
    ctx.save();
    ctx.globalAlpha = progress;

    const radius = (1 - progress) * 80 + 20;
    ctx.beginPath(); ctx.arc(s.x, s.y, radius, 0, Math.PI * 2);
    ctx.fillStyle = s.color; ctx.fill();

    ctx.beginPath(); ctx.arc(s.x, s.y, radius * 0.35, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff'; ctx.fill();

    const numSpikes = 12, innerR = radius * 0.5, outerR = radius * 1.6;
    ctx.strokeStyle = s.color; ctx.lineWidth = 3;
    for (let i = 0; i < numSpikes; i++) {
      const angle = (i / numSpikes) * Math.PI * 2 + (1 - progress) * 0.5;
      ctx.beginPath();
      ctx.moveTo(s.x + Math.cos(angle) * innerR, s.y + Math.sin(angle) * innerR);
      ctx.lineTo(s.x + Math.cos(angle) * outerR, s.y + Math.sin(angle) * outerR);
      ctx.stroke();
    }
    ctx.restore();
    if (--this._clashSpark.ticks <= 0) this._clashSpark = null;
  }

  // ─── Main Loop ─────────────────────────────────────────────────────────────

  run() {
    setInterval(() => {
      // UPDATE
      if (this.state === GAME_STATE.PLAYING && !this._transitioning) {
        this.inputHandler.update(this.fighter);
        this.fighter.update(PLATFORMS);

        for (const e of this.enemies) e.update(this.fighter);
        for (const p of this.powerups) p.update();

        this._checkCombat();
        this._checkPowerups();
        this._spawnEnemies();
        this.enemies  = this.enemies.filter(e => !e.markedForRemoval);
        this._checkStageComplete();
        this._checkPlayerDeath();

        if (this._comboTimer > 0 && --this._comboTimer <= 0) this._combo = 0;
        if (this._starTicks   > 0) this._starTicks--;
        if (this._shieldTicks > 0) this._shieldTicks--;
      }

      // DRAW — shake wraps all game graphics
      this.ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      this.ctx.save();
      if (this._shake > 0) {
        this.ctx.translate(Math.random() * 8 - 4, Math.random() * 8 - 4);
        this._shake--;
      }

      this.drawBackground();

      if (this.state === GAME_STATE.START) {
        this.fighter.draw(this.ctx);
        this.drawStartScreen();
      } else {
        this.powerups.forEach(p => p.draw(this.ctx));
        this.enemies.forEach(e => e.draw(this.ctx));
        this.fighter.draw(this.ctx);
        this._drawClashSpark();
        this._drawCombo();
        this._drawFatigue();
        if (this.state === GAME_STATE.PLAYING) this.drawHUD();
        if (this.state === GAME_STATE.OVER)    this.drawGameOver();
      }

      this.ctx.restore();

      if (this.overlayRenderer) this.overlayRenderer();

      this.tick++;
    }, HEART_BEAT);
  }
}

export default Game;
