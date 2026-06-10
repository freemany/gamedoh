import { CANVAS_WIDTH } from './constants.js';

const CLOUD_COUNT = 5;
const PARALLAX   = 0.3;

function randomCloud(game, x) {
  const groundY = (game.height - game.groundHeight) * game.blockSize;
  return {
    x,
    y:      Math.random() * (groundY * 0.5) + 20, // upper half of canvas
    radius: 8 + Math.random() * 10,               // 8–18 px
  };
}

class Clouds {
  constructor(game) {
    this.game = game;
    this._clouds = Array.from({ length: CLOUD_COUNT }, (_, i) =>
      randomCloud(game, (CANVAS_WIDTH / CLOUD_COUNT) * i + Math.random() * 60)
    );
  }

  update() {
    const dx = this.game.speed * PARALLAX;
    for (const c of this._clouds) {
      c.x -= dx;
      if (c.x + c.radius * 3 < 0) {
        // Recycle: pop back to a random distance off the right edge
        c.x = CANVAS_WIDTH + 40 + Math.random() * 120;
        Object.assign(c, randomCloud(this.game, c.x));
      }
    }
    return this;
  }

  draw(ctx) {
    ctx.save();
    ctx.fillStyle = '#fff';

    for (const { x, y, radius: r } of this._clouds) {
      ctx.beginPath();
      ctx.arc(x,           y,           r,       0, Math.PI * 2);
      ctx.arc(x + r,       y - r * 0.4, r * 0.8, 0, Math.PI * 2);
      ctx.arc(x + r * 1.8, y,           r * 0.7, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
    return this;
  }
}

export default Clouds;
