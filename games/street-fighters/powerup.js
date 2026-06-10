import { GROUND_Y, FIGHTER_BLOCK_SIZE } from './constants.js';

const TYPES = ['heart', 'star', 'shield'];

const DEFS = {
  heart:  { label: '♥', color: '#ff4444', glow: '#ff8888' },
  star:   { label: '★', color: '#ffff00', glow: '#ffcc00' },
  shield: { label: '⬡', color: '#44aaff', glow: '#88ccff' },
};

class PowerUp {
  constructor(x) {
    this.x         = x;
    this.y         = GROUND_Y;
    this.type      = TYPES[Math.floor(Math.random() * TYPES.length)];
    this.collected = false;
    this._phase    = Math.random() * Math.PI * 2;
  }

  update() {
    this._phase += 0.25;
  }

  draw(ctx) {
    const bs  = FIGHTER_BLOCK_SIZE;
    const def = DEFS[this.type];
    const px  = (this.x + 25) * bs;
    const py  = this.y * bs - 12 + Math.sin(this._phase) * 5;

    ctx.save();
    ctx.font         = 'bold 30px monospace';
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor  = def.glow;
    ctx.shadowBlur   = 14;
    ctx.fillStyle    = def.color;
    ctx.fillText(def.label, px, py);
    ctx.shadowBlur   = 0;

    // Small label beneath
    ctx.font      = '10px monospace';
    ctx.fillStyle = def.color;
    const names   = { heart: 'HEAL', star: 'POWER', shield: 'SHIELD' };
    ctx.fillText(names[this.type], px, py + 20);

    ctx.restore();
  }

  // AABB in canvas pixels for pickup detection
  getBox() {
    const bs = FIGHTER_BLOCK_SIZE;
    return {
      x: (this.x + 10) * bs,
      y: (this.y - 12) * bs,
      w: 30 * bs,
      h: 14 * bs,
    };
  }
}

export default PowerUp;
