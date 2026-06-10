import {
  BALL_SIZE,
  BALL_SPEED_INCREMENT,
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  PADDLE_Y,
  PADDLE_W,
} from './constants.js';

class Ball {
  constructor(game) {
    this.game = game;
    this._speed = 3;
    this.reset();
  }

  setSpeed(speed) {
    this._speed = speed;
    this._launch();
  }

  reset() {
    this.width = BALL_SIZE;
    this.height = BALL_SIZE;
    this.x = (CANVAS_WIDTH - BALL_SIZE) / 2;
    this.y = PADDLE_Y - BALL_SIZE - 10;
    this._launch();
  }

  _launch() {
    // angle between 40° and 140° upward (so -vy, spread horizontally)
    const angle = (Math.random() * 100 + 40) * (Math.PI / 180);
    this.vx = Math.cos(angle) * this._speed * (Math.random() < 0.5 ? 1 : -1);
    this.vy = -Math.abs(Math.sin(angle) * this._speed);
  }

  _currentSpeed() {
    return Math.sqrt(this.vx * this.vx + this.vy * this.vy);
  }

  _setSpeed(s) {
    const cur = this._currentSpeed();
    if (cur === 0) return;
    this.vx = (this.vx / cur) * s;
    this.vy = (this.vy / cur) * s;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;

    // Bounce off left / right walls
    if (this.x <= 0) {
      this.x = 0;
      this.vx = Math.abs(this.vx);
    } else if (this.x + this.width >= CANVAS_WIDTH) {
      this.x = CANVAS_WIDTH - this.width;
      this.vx = -Math.abs(this.vx);
    }

    // Bounce off ceiling
    if (this.y <= 0) {
      this.y = 0;
      this.vy = Math.abs(this.vy);
    }

    // Ball fell below screen → lose a life
    if (this.y > CANVAS_HEIGHT) {
      this.game.loseLife();
      return;
    }

    // Paddle collision
    const paddle = this.game.paddle;
    if (
      this.vy > 0 &&
      this.y + this.height >= paddle.y &&
      this.y + this.height <= paddle.y + paddle.height + Math.abs(this.vy) &&
      this.x + this.width > paddle.x &&
      this.x < paddle.x + paddle.width
    ) {
      // Reflect upward
      this.vy = -Math.abs(this.vy);
      this.y = paddle.y - this.height;

      // Adjust horizontal based on hit position (left edge → left, right → right)
      const offset = (this.x + this.width / 2 - paddle.centreX) / (paddle.width / 2);
      const newSpeed = this._currentSpeed() + BALL_SPEED_INCREMENT;
      this._speed = newSpeed;
      this.vx = offset * newSpeed * 0.9;
      this.vy = -Math.sqrt(Math.max(newSpeed * newSpeed - this.vx * this.vx, 0.5));
    }
  }

  draw(ctx) {
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(this.x + this.width / 2, this.y + this.height / 2, this.width / 2, 0, Math.PI * 2);
    ctx.fill();
    // Glint
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.beginPath();
    ctx.arc(this.x + this.width / 2 - 2, this.y + this.height / 2 - 2, 2, 0, Math.PI * 2);
    ctx.fill();
  }
}

export default Ball;
