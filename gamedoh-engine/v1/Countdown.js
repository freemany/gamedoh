import Timer from './Timer.js';

class Countdown {
  constructor(game, seconds) {
    this.game = game;
    this.seconds = seconds;
  }

  draw(remaining) {
    const { ctx, blockSize, width, height } = this.game;
    const cx = (width / 2) * blockSize;
    const cy = (height / 2) * blockSize;
    const radius = 80;
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.strokeStyle = 'Black';
    ctx.lineWidth = 4;
    ctx.stroke();
    ctx.font = '160px Courier';
    ctx.fillStyle = 'Black';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(remaining, cx, cy);
    ctx.restore();
  }

  async start() {
    await new Timer(this.seconds).start((remaining) => {
      this.game.transitionRenderer = () => this.draw(remaining);
    });
    this.game.transitionRenderer = null;
  }
}

export default Countdown;
