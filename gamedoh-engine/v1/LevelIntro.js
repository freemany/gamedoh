// LEVEL_INTRO_DURATION — how long to show the intro screen in ms, e.g. 2000
class LevelIntro {
  constructor(game, levelNumber, duration = 0) {
    this.game = game;
    this.levelNumber = levelNumber;
    this.duration = duration;
  }

  draw() {
    const { ctx, blockSize, width, height } = this.game;
    const cx = (width / 2) * blockSize;
    const cy = (height / 2) * blockSize;
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = 'Black';
    ctx.font = '80px Courier';
    ctx.fillText(`Level ${this.levelNumber}`, cx, cy - 20);
    ctx.font = '30px Arial';
    ctx.fillText('Get Ready!', cx, cy + 40);
    ctx.restore();
  }
  wha;

  start() {
    return new Promise((resolve) => {
      this.game.transitionRenderer = () => this.draw();
      setTimeout(() => {
        this.game.transitionRenderer = null;
        resolve();
      }, this.duration);
    });
  }
}

export default LevelIntro;
