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
      `Score: ${this.game.board.score}`,
      this.x * this.game.blockSize,
      this.y * this.game.blockSize
    );
    ctx.fillStyle = 'Red';
    ctx.fillText(
      `Life: ${this.game.board.life}`,
      this.x * this.game.blockSize,
      (this.y + 5) * this.game.blockSize
    );
    ctx.restore();
  }
}

export default ScoreBoard;
