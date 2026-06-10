import { CANVAS_WIDTH, CANVAS_HEIGHT, LEVEL_INTRO_DURATION } from './constants.js';

/**
 * Shows "STAGE X / GET READY!" overlay for LEVEL_INTRO_DURATION ms.
 * Uses game.overlayRenderer so it renders over the game world each tick.
 * NOTE: Never use the engine's built-in LevelIntro — it draws black on black.
 */
export async function showLevelIntro(game, stageNum) {
  return new Promise((resolve) => {
    game.overlayRenderer = () => {
      const { ctx } = game;
      ctx.save();
      ctx.fillStyle = 'rgba(0,0,0,0.75)';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#ffcc00';
      ctx.font = 'bold 64px monospace';
      ctx.fillText(`STAGE  ${stageNum}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 36);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 26px monospace';
      ctx.fillText('GET READY!', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 36);
      ctx.restore();
    };
    setTimeout(() => {
      game.overlayRenderer = null;
      resolve();
    }, LEVEL_INTRO_DURATION);
  });
}

/**
 * Shows a 3-2-1 countdown. Each number shows for 1000ms.
 * NOTE: Never use the engine's built-in Countdown — it draws black on black.
 */
export async function showCountdown(game) {
  for (let n = 3; n >= 1; n--) {
    await new Promise((resolve) => {
      const colour = n === 1 ? '#ff4444' : n === 2 ? '#ff9800' : '#00ccff';
      game.overlayRenderer = () => {
        const { ctx } = game;
        const cx = CANVAS_WIDTH / 2;
        const cy = CANVAS_HEIGHT / 2;
        ctx.save();
        ctx.fillStyle = 'rgba(0,0,0,0.65)';
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        ctx.beginPath();
        ctx.arc(cx, cy, 70, 0, Math.PI * 2);
        ctx.strokeStyle = colour;
        ctx.lineWidth = 5;
        ctx.stroke();
        ctx.fillStyle = colour;
        ctx.font = 'bold 90px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(n, cx, cy + 5);
        ctx.restore();
      };
      setTimeout(resolve, 1000);
    });
  }
  game.overlayRenderer = null;
}
