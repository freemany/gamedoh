import { CANVAS_WIDTH } from './constants.js';

class ScoreBoard {
  constructor(game) {
    this.game = game;
  }

  draw(ctx) {
    const { score, blockSize } = this.game;
    ctx.save();
    ctx.textAlign = 'right';
    ctx.textBaseline = 'top';
    ctx.fillStyle = '#555';
    ctx.font = `bold ${blockSize * 3}px monospace`;
    ctx.fillText(String(score).padStart(5, '0'), CANVAS_WIDTH - blockSize * 2, blockSize * 1.5);
    ctx.restore();
  }
}

export default ScoreBoard;
