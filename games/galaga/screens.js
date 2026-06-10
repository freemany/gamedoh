import { Timer } from './gamedoh-engine.js';
import { CANVAS_WIDTH, CANVAS_HEIGHT, HUD_TOP_H } from './constants.js';

// Custom level intro — white text on dark overlay, visible against black background
export async function showLevelIntro(game, levelNum, duration = 2000) {
  const challenging = levelNum === 'CHALLENGING STAGE';
  return new Promise((resolve) => {
    game.transitionRenderer = () => {
      const { ctx } = game;
      ctx.save();
      ctx.fillStyle = 'rgba(0,0,0,0.7)';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#ffff00';
      ctx.font = 'bold 48px monospace';
      if (challenging) {
        ctx.fillText('CHALLENGING', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 48);
        ctx.fillText('STAGE', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 22px monospace';
        ctx.fillText('GET READY!', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 52);
      } else {
        ctx.fillText(`STAGE  ${levelNum}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 24);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 22px monospace';
        ctx.fillText('GET READY!', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 28);
      }
      ctx.restore();
    };
    setTimeout(() => {
      game.transitionRenderer = null;
      resolve();
    }, duration);
  });
}

// Custom 3-2-1 countdown — large coloured number on dark overlay
export async function showCountdown(game) {
  await new Timer(3).start((remaining) => {
    game.transitionRenderer = () => {
      const { ctx } = game;
      const cx = CANVAS_WIDTH / 2;
      const cy = CANVAS_HEIGHT / 2;
      ctx.save();
      ctx.fillStyle = 'rgba(0,0,0,0.65)';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      // Circle
      ctx.beginPath();
      ctx.arc(cx, cy, 60, 0, Math.PI * 2);
      ctx.strokeStyle = remaining === 1 ? '#ff4444' : remaining === 2 ? '#ff9800' : '#00ccff';
      ctx.lineWidth = 4;
      ctx.stroke();
      // Number
      ctx.fillStyle = remaining === 1 ? '#ff4444' : remaining === 2 ? '#ff9800' : '#00ccff';
      ctx.font = 'bold 80px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(remaining, cx, cy + 4);
      ctx.restore();
    };
  });
  game.transitionRenderer = null;
}

export async function showBossIntro(game) {
  return new Promise((resolve) => {
    game.transitionRenderer = () => {
      const { ctx } = game;
      ctx.save();
      ctx.fillStyle = 'rgba(0,0,0,0.75)';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#ff2222';
      ctx.font = 'bold 52px monospace';
      ctx.fillText('BOSS STAGE', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 28);
      ctx.fillStyle = '#ff9800';
      ctx.font = 'bold 20px monospace';
      ctx.fillText('DESTROY ALL BOSS GALAGA!', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 28);
      ctx.restore();
    };
    setTimeout(() => {
      game.transitionRenderer = null;
      resolve();
    }, 2500);
  });
}

export function drawStartScreen(ctx, startButton) {
  ctx.save();

  // Black background
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // Static stars
  ctx.fillStyle = '#ffffff';
  for (let i = 0; i < 60; i++) {
    const x = (i * 137 + 17) % CANVAS_WIDTH;
    const y = (i * 97 + 53) % (CANVAS_HEIGHT - 100);
    ctx.globalAlpha = 0.3 + (i % 5) * 0.1;
    ctx.fillRect(x, y, i % 3 === 0 ? 2 : 1, i % 3 === 0 ? 2 : 1);
  }
  ctx.globalAlpha = 1;

  // Title
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#ffff00';
  ctx.font = 'bold 56px monospace';
  ctx.fillText('GALAGA', CANVAS_WIDTH / 2, 110);

  // Subtitle
  ctx.fillStyle = '#ff0000';
  ctx.font = 'bold 13px monospace';
  ctx.fillText('NAMCO 1981 — RECREATION', CANVAS_WIDTH / 2, 152);

  // Controls (compact)
  ctx.font = '12px monospace';
  ctx.fillStyle = '#aaaaaa';
  ctx.fillText('\u2190 \u2192  Move     SPACE  Fire     P  Pause', CANVAS_WIDTH / 2, 180);
  ctx.fillStyle = '#88ccff';
  ctx.fillText('Rescue captured ship to unlock DUAL FIGHTER', CANVAS_WIDTH / 2, 200);

  // Stage map header
  const sx = CANVAS_WIDTH / 2;
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 13px monospace';
  ctx.fillText('— STAGES —', sx, 232);

  // Divider
  ctx.strokeStyle = 'rgba(255,255,255,0.2)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(60, 244); ctx.lineTo(CANVAS_WIDTH - 60, 244);
  ctx.stroke();

  // Stage rows
  const stages = [
    { num: 1, color: '#00ccff',  badge: '■ ■ ■ ■', label: 'Normal',           sub: '24 mixed enemies' },
    { num: 2, color: '#ffff44',  badge: '» » » »', label: 'Challenging Stage', sub: 'No shooting — bonus waves' },
    { num: 3, color: '#00ccff',  badge: '■ ■ ■ ■', label: 'Normal',           sub: '36 mixed enemies' },
    { num: 4, color: '#ff4444',  badge: '★ ★ ★ ★', label: 'BOSS STAGE',       sub: '10 Boss Galaga only' },
  ];

  const rowH = 38;
  const startY = 262;

  stages.forEach(({ num, color, badge, label, sub }, i) => {
    const y = startY + i * rowH;

    // Stage number
    ctx.textAlign = 'right';
    ctx.fillStyle = '#888888';
    ctx.font = '11px monospace';
    ctx.fillText(`${num}`, 72, y + 6);

    // Badge
    ctx.textAlign = 'left';
    ctx.fillStyle = color;
    ctx.font = 'bold 11px monospace';
    ctx.fillText(badge, 82, y + 6);

    // Label
    ctx.fillStyle = color;
    ctx.font = 'bold 13px monospace';
    ctx.fillText(label, 82, y + 22);

    // Sub description
    ctx.fillStyle = '#888888';
    ctx.font = '11px monospace';
    ctx.fillText(sub, 82, y + 35);
  });

  // Row dividers
  ctx.strokeStyle = 'rgba(255,255,255,0.08)';
  ctx.lineWidth = 1;
  for (let i = 1; i < stages.length; i++) {
    const y = startY + i * rowH - 4;
    ctx.beginPath();
    ctx.moveTo(60, y); ctx.lineTo(CANVAS_WIDTH - 60, y);
    ctx.stroke();
  }

  ctx.restore();
  if (startButton) startButton.draw(ctx);
}

export function drawPauseOverlay(ctx) {
  ctx.save();
  ctx.fillStyle = 'rgba(0,0,0,0.6)';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 36px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('PAUSED', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
  ctx.font = '14px monospace';
  ctx.fillStyle = '#aaaaaa';
  ctx.fillText('Press P to resume', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 40);
  ctx.restore();
}

export function drawGameOverScreen(ctx, score, restartButton) {
  ctx.save();
  ctx.fillStyle = 'rgba(0,0,0,0.85)';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#ff0000';
  ctx.font = 'bold 42px monospace';
  ctx.fillText('GAME OVER', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 60);
  ctx.fillStyle = '#ffffff';
  ctx.font = '20px monospace';
  ctx.fillText(`SCORE: ${score}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
  ctx.restore();
  if (restartButton) restartButton.draw(ctx);
}

export function drawWinScreen(ctx, score, restartButton) {
  ctx.save();
  ctx.fillStyle = 'rgba(0,0,40,0.9)';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#ffff00';
  ctx.font = 'bold 28px monospace';
  ctx.fillText('CONGRATULATIONS', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 70);
  ctx.fillStyle = '#00ff88';
  ctx.font = 'bold 20px monospace';
  ctx.fillText('ALL STAGES CLEARED!', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 30);
  ctx.fillStyle = '#ffffff';
  ctx.font = '18px monospace';
  ctx.fillText(`FINAL SCORE: ${score}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 20);
  ctx.restore();
  if (restartButton) restartButton.draw(ctx);
}
