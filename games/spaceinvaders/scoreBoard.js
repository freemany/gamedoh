class ScoreBoard {
  constructor(game, { x, y }) {
    this.game = game;
    this.x = x;
    this.y = y;
  }

  update() {
    return this;
  }

  draw(ctx) {
    ctx.save();
    ctx.fillStyle = 'Black';
    ctx.font = '20px Arial';
    ctx.fillText(
      `Score: ${this.game.score}`,
      this.x * this.game.blockSize,
      this.y * this.game.blockSize
    );
    ctx.restore();
  }
}

export default ScoreBoard;
