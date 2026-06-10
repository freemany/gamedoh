import { CANVAS_WIDTH, CANVAS_HEIGHT } from './constants.js';

const STAR_COUNT = 80;

class Starfield {
  constructor() {
    this._stars = Array.from({ length: STAR_COUNT }, () => ({
      x: Math.random() * CANVAS_WIDTH,
      y: Math.random() * CANVAS_HEIGHT,
      speed: 0.5 + Math.random() * 2,
      size: Math.random() < 0.3 ? 2 : 1,
      alpha: 0.4 + Math.random() * 0.6,
    }));
  }

  update() {
    for (const s of this._stars) {
      s.y += s.speed;
      if (s.y > CANVAS_HEIGHT) {
        s.y = 0;
        s.x = Math.random() * CANVAS_WIDTH;
      }
    }
  }

  draw(ctx) {
    ctx.save();
    ctx.fillStyle = '#ffffff';
    for (const s of this._stars) {
      ctx.globalAlpha = s.alpha;
      ctx.fillRect(Math.floor(s.x), Math.floor(s.y), s.size, s.size);
    }
    ctx.restore();
  }
}

export default Starfield;
