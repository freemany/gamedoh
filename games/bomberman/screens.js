import {
  CANVAS_WIDTH, CANVAS_HEIGHT, GRID_OFFSET_Y,
  TILE_SIZE, TILE_HARD, TILE_SOFT,
} from './constants.js';

export const drawStartScreen = (ctx, startButton) => {
  ctx.save();

  // Dark background
  ctx.fillStyle = '#0d0d1a';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // Grid lines (subtle)
  ctx.strokeStyle = 'rgba(255,255,255,0.04)';
  ctx.lineWidth = 1;
  for (let x = 0; x < CANVAS_WIDTH; x += 64) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, CANVAS_HEIGHT); ctx.stroke();
  }
  for (let y = 0; y < CANVAS_HEIGHT; y += 64) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(CANVAS_WIDTH, y); ctx.stroke();
  }

  // Title
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#ff9800';
  ctx.font = 'bold 80px monospace';
  ctx.fillText('BOMBERMAN', CANVAS_WIDTH / 2, 180);

  // Subtitle
  ctx.fillStyle = '#fdd835';
  ctx.font = 'bold 22px monospace';
  ctx.fillText('Single Player', CANVAS_WIDTH / 2, 238);

  // ── How to Play ───────────────────────────────────────────────────────────
  const cx = CANVAS_WIDTH / 2;
  let y = 278;

  // Section: Controls
  ctx.fillStyle = '#ff9800';
  ctx.font = 'bold 18px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('— HOW TO PLAY —', cx, y);
  y += 36;

  const controls = [
    ['← ↑ → ↓', 'Move Bomberman'],
    ['Space',    'Plant a bomb'],
    ['X',        'Detonate remote bomb'],
    ['P',        'Pause / Resume'],
  ];
  for (const [key, desc] of controls) {
    ctx.fillStyle = '#ffdd88';
    ctx.font = 'bold 17px monospace';
    ctx.textAlign = 'right';
    ctx.fillText(key, cx - 8, y);
    ctx.fillStyle = '#ccccee';
    ctx.font = '17px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(desc, cx + 8, y);
    y += 30;
  }

  y += 18;

  // Section: Objective
  ctx.fillStyle = '#ff9800';
  ctx.font = 'bold 18px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('— OBJECTIVE —', cx, y);
  y += 32;

  const objectives = [
    ['Blast soft blocks to find hidden items'],
    ['Collect the  KEY  to unlock the exit'],
    ['Reach the  EXIT  to advance the level'],
    ['Defeat enemies with bomb explosions'],
    ['Beat all 3 levels before time runs out!'],
  ];
  for (const [line] of objectives) {
    ctx.fillStyle = '#88dd88';
    ctx.font = '16px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(line, cx, y);
    y += 26;
  }

  y += 18;

  // Section: Power-ups
  ctx.fillStyle = '#ff9800';
  ctx.font = 'bold 18px monospace';
  ctx.fillText('— POWER-UPS —', cx, y);
  y += 32;

  const powerups = [
    ['B+', '#ffaa00', 'Extra bomb'],
    ['F+', '#ff4444', 'Bigger explosion'],
    ['RC', '#44aaff', 'Remote detonator'],
    ['P+', '#cc88ff', 'Pierce through blocks'],
    ['♥',  '#ff4466', 'Extra life'],
  ];
  const col1 = cx - 220, col2 = cx - 180, col3 = cx - 155;
  for (const [icon, color, label] of powerups) {
    ctx.fillStyle = color;
    ctx.font = 'bold 16px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(icon, col1, y);
    ctx.fillStyle = '#888899';
    ctx.fillText('—', col2, y);
    ctx.fillStyle = '#ccccee';
    ctx.font = '16px monospace';
    ctx.fillText(label, col3, y);
    y += 26;
  }

  ctx.restore();

  // Start button above bottom with breathing room
  startButton.x = CANVAS_WIDTH / 2 + 60;
  startButton.y = y + 24;
  startButton.draw(ctx);
};

export const drawPauseOverlay = (ctx) => {
  ctx.save();
  ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 56px monospace';
  ctx.fillText('PAUSED', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 30);
  ctx.fillStyle = '#aaaacc';
  ctx.font = '22px monospace';
  ctx.fillText('[P] to resume', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 30);
  ctx.restore();
};

export const drawGameOverScreen = (ctx, score, restartButton) => {
  ctx.save();
  ctx.fillStyle = 'rgba(0, 0, 0, 0.82)';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#e53935';
  ctx.font = 'bold 64px monospace';
  ctx.fillText('GAME OVER', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 80);
  ctx.fillStyle = '#ffffff';
  ctx.font = '28px monospace';
  ctx.fillText(`Score: ${score}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
  ctx.restore();
  restartButton.x = CANVAS_WIDTH / 2 + 60;
  restartButton.y = CANVAS_HEIGHT / 2 + 70;
  restartButton.draw(ctx);
};

export const drawWinScreen = (ctx, score, restartButton) => {
  ctx.save();
  ctx.fillStyle = 'rgba(0, 40, 0, 0.88)';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#fdd835';
  ctx.font = 'bold 64px monospace';
  ctx.fillText('YOU WIN!', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 80);
  ctx.fillStyle = '#ffffff';
  ctx.font = '28px monospace';
  ctx.fillText(`Score: ${score}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
  ctx.restore();
  restartButton.x = CANVAS_WIDTH / 2 + 60;
  restartButton.y = CANVAS_HEIGHT / 2 + 70;
  restartButton.draw(ctx);
};

export const drawWorld = (game) => {
  const { ctx } = game;

  // ── HUD bar background ──────────────────────────────────────────────────────
  ctx.save();
  ctx.fillStyle = '#1a1a2e';
  ctx.fillRect(0, 0, CANVAS_WIDTH, GRID_OFFSET_Y);
  ctx.restore();

  // ── Grid tiles ──────────────────────────────────────────────────────────────
  ctx.save();
  for (let r = 0; r < game.rows; r++) {
    for (let c = 0; c < game.cols; c++) {
      const px = game.gridOffsetX + c * TILE_SIZE;
      const py = GRID_OFFSET_Y + r * TILE_SIZE;
      const tile = game.grid[r]?.[c];

      if (tile === TILE_HARD) {
        ctx.fillStyle = '#4a4a5a';
        ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
        ctx.fillStyle = '#5a5a6e';
        ctx.fillRect(px + 2, py + 2, TILE_SIZE - 4, 8);
        ctx.fillStyle = '#38384a';
        ctx.fillRect(px + 2, py + TILE_SIZE - 6, TILE_SIZE - 4, 4);
        ctx.strokeStyle = '#333345';
        ctx.lineWidth = 1;
        ctx.strokeRect(px, py, TILE_SIZE, TILE_SIZE);
      } else if (tile === TILE_SOFT) {
        ctx.fillStyle = '#8b4513';
        ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
        ctx.fillStyle = '#a0522d';
        ctx.fillRect(px + 3, py + 3, TILE_SIZE - 6, TILE_SIZE - 6);
        ctx.fillStyle = '#7a3010';
        ctx.fillRect(px, py + TILE_SIZE / 3, TILE_SIZE, 3);
        ctx.fillRect(px, py + (2 * TILE_SIZE) / 3, TILE_SIZE, 3);
        ctx.fillRect(px + TILE_SIZE / 2, py, 3, TILE_SIZE / 3);
        ctx.fillRect(px + TILE_SIZE / 4, py + TILE_SIZE / 3, 3, TILE_SIZE / 3);
        ctx.fillRect(px + (3 * TILE_SIZE) / 4, py + (2 * TILE_SIZE) / 3, 3, TILE_SIZE / 3);
      } else {
        const shade = (r + c) % 2 === 0 ? '#2d5a1b' : '#356820';
        ctx.fillStyle = shade;
        ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
      }

      if (game.exitVisible && c === game.exitCol && r === game.exitRow) {
        const locked = !game.hasKey;
        ctx.fillStyle = locked ? '#555577' : '#00c853';
        ctx.fillRect(px + 4, py + 4, TILE_SIZE - 8, TILE_SIZE - 8);
        ctx.fillStyle = locked ? '#333355' : '#004d20';
        ctx.fillRect(px + 18, py + 20, 28, 36);
        ctx.fillStyle = locked ? '#ffaa00' : '#ffffff';
        ctx.font = 'bold 18px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(locked ? '🔒' : '→', px + TILE_SIZE / 2, py + TILE_SIZE / 2);
      }
    }
  }
  ctx.restore();

  game.items.forEach(i => i.draw(ctx));
  game.flames.forEach(f => f.draw(ctx));
  game.bombs.forEach(b => b.draw(ctx));
  game.enemies.forEach(e => e.draw(ctx));
  if (game.player) game.player.draw(ctx);

  // ── KEY GET banner ──────────────────────────────────────────────────────────
  if (game._keyMessageTimer > 0) {
    game._keyMessageTimer--;
    const alpha = Math.min(1, game._keyMessageTimer / 20);
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = '#fdd835';
    ctx.font = 'bold 32px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🗝  KEY GET!  Find the EXIT!', CANVAS_WIDTH / 2, GRID_OFFSET_Y + 36);
    ctx.restore();
  }
};

export const drawHUD = (game) => {
  if (game._transitioning) return;
  const { ctx } = game;
  ctx.save();
  ctx.textBaseline = 'middle';

  const sec = Math.max(0, Math.ceil(game._timerMs / 1000));
  const mm = String(Math.floor(sec / 60)).padStart(2, '0');
  const ss = String(sec % 60).padStart(2, '0');
  const timerColor = sec <= 10 ? '#ff1744' : sec <= 30 ? '#ff9800' : '#ffffff';

  // ── Top row (y=22): level  score  key ──────────────────────────────────────
  ctx.font = '14px monospace';
  ctx.textAlign = 'left';
  ctx.fillStyle = '#90caf9';
  ctx.fillText(`LEVEL ${game.level.index + 1}`, 16, 22);

  ctx.textAlign = 'center';
  ctx.fillStyle = '#cccccc';
  ctx.fillText(`SCORE: ${game.score}`, CANVAS_WIDTH / 2, 22);

  if (game.hasKey) {
    ctx.textAlign = 'right';
    ctx.fillStyle = '#fdd835';
    ctx.fillText('KEY  🗝', CANVAS_WIDTH - 16, 22);
  }

  // ── Divider line ────────────────────────────────────────────────────────────
  ctx.strokeStyle = 'rgba(255,255,255,0.1)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, 34);
  ctx.lineTo(CANVAS_WIDTH, 34);
  ctx.stroke();

  // ── Bottom row (y=64): lives  |  controls  |  timer ────────────────────────
  ctx.textAlign = 'left';
  ctx.fillStyle = '#e53935';
  ctx.font = 'bold 26px monospace';
  ctx.fillText('♥'.repeat(Math.max(0, game.lives)), 16, 64);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 15px monospace';
  ctx.textAlign = 'left';
  ctx.fillText('↑↓←→ move   X detonate', 120, 64);
  ctx.fillText('Space bomb   P pause', CANVAS_WIDTH / 2 + 120, 64);

  // Timer — large, centred
  ctx.textAlign = 'center';
  ctx.font = 'bold 38px monospace';
  ctx.fillStyle = 'rgba(0,0,0,0.5)';
  ctx.fillText(`${mm}:${ss}`, CANVAS_WIDTH / 2 + 1, 65);
  ctx.fillStyle = timerColor;
  ctx.fillText(`${mm}:${ss}`, CANVAS_WIDTH / 2, 64);

  ctx.restore();
};
