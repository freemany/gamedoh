import { PADDLE_W, PADDLE_H, PADDLE_Y, PADDLE_SPEED, CANVAS_WIDTH } from './constants.js';

class Paddle {
  constructor(game) {
    this.game = game;
    this.width = PADDLE_W;
    this.height = PADDLE_H;
    this.x = (CANVAS_WIDTH - PADDLE_W) / 2;
    this.y = PADDLE_Y;
  }

  move(dir) {
    if (dir === 'left') {
      this.x = Math.max(0, this.x - PADDLE_SPEED);
    } else if (dir === 'right') {
      this.x = Math.min(CANVAS_WIDTH - this.width, this.x + PADDLE_SPEED);
    }
  }

  get centreX() {
    return this.x + this.width / 2;
  }

  draw(ctx) {
    // Main paddle body
    ctx.fillStyle = '#4fc3f7';
    ctx.beginPath();
    ctx.roundRect(this.x, this.y, this.width, this.height, 4);
    ctx.fill();
    // Highlight
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.beginPath();
    ctx.roundRect(this.x + 2, this.y + 2, this.width - 4, 4, 2);
    ctx.fill();
  }
}

export default Paddle;
