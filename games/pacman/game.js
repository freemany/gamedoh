class Game {
  constructor(ctx) {
    this.ctx = ctx;
    this.score = 0;
  }

  over() {
    clearInterval(this.intervalId);
    this.ctx.save();
    this.ctx.font = '60px Courier';
    this.ctx.fillStyle = 'Black';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(
      'Game Over',
      (this.width / 2) * this.blockSize,
      (this.height / 2) * this.blockSize
    );
    this.ctx.restore();
  }
}

export default Game;
