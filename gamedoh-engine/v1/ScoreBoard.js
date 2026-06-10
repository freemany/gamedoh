class ScoreBoard {
  constructor(game) {
    this.game = game;
  }

  draw(ctx, { textAlign, textBaseline, fillStyle, font } = {}) {
    const { blockSize, canvasWidth, score } = this.game;
    textAlign = textAlign ?? 'center';
    textBaseline = textBaseline ?? 'top';
    fillStyle = fillStyle ?? '#fff';
    font = font ?? `bold ${blockSize * 3}px monospace`;

    ctx.save();
    ctx.textAlign = textAlign;
    ctx.textBaseline = textBaseline;
    ctx.fillStyle = fillStyle;
    ctx.font = font;
    ctx.fillText(String(score).padStart(5, '0'), canvasWidth / 2, blockSize * 1.5);
    ctx.restore();
  }
}

export default ScoreBoard;
