import { TILE_SIZE, GRID_OFFSET_Y, ITEM_BOMB_UP, ITEM_FIRE_UP, ITEM_HEART, ITEM_REMOTE, ITEM_PIERCE, ITEM_KEY } from './constants.js';
import { playSound } from './sounds.js';

const ITEM_COLORS = {
  BOMB_UP: '#e53935',
  FIRE_UP: '#ff9800',
  HEART:   '#e91e63',
  REMOTE:  '#9c27b0',
  PIERCE:  '#00bcd4',
  KEY:     '#fdd835',
};

const ITEM_LABELS = {
  BOMB_UP: 'B+',
  FIRE_UP: 'F+',
  HEART:   '♥',
  REMOTE:  'RC',
  PIERCE:  'P+',
  KEY:     'KEY',
};

class Item {
  constructor(game, col, row, type) {
    this.game = game;
    this.col = col;
    this.row = row;
    this.x = game.gridOffsetX + col * TILE_SIZE;
    this.y = GRID_OFFSET_Y + row * TILE_SIZE;
    this.type = type;
    this.alive = true;
    this._bobTimer = Math.random() * Math.PI * 2; // offset for bobbing animation
  }

  update() {
    this._bobTimer += 0.08;
  }

  collect(player) {
    this.alive = false;
    const type = this.type;

    if (type === ITEM_BOMB_UP) {
      player.maxBombs++;
      playSound('collect');
    } else if (type === ITEM_FIRE_UP) {
      player.firePower++;
      playSound('collect');
    } else if (type === ITEM_HEART) {
      if (this.game.lives < 5) this.game.lives++;
      playSound('collect');
    } else if (type === ITEM_REMOTE) {
      player.remote = true;
      playSound('collect');
    } else if (type === ITEM_PIERCE) {
      player.pierce = true;
      playSound('collect');
    } else if (type === ITEM_KEY) {
      this.game.hasKey = true;
      this.game._keyMessageTimer = 180; // show banner for ~3s
      playSound('key');
    }
  }

  draw(ctx) {
    ctx.save();

    const bob = Math.sin(this._bobTimer) * 3;
    const x = this.x + 6;
    const y = this.y + 6 + bob;
    const w = TILE_SIZE - 12;
    const h = TILE_SIZE - 12;

    // Background rounded rect
    const color = ITEM_COLORS[this.type] || '#888';
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 6);
    ctx.fill();

    // Highlight
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.beginPath();
    ctx.roundRect(x + 3, y + 3, w - 6, h / 3, 4);
    ctx.fill();

    // Label
    const label = ITEM_LABELS[this.type] || '?';
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${label.length > 2 ? 10 : 14}px monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, x + w / 2, y + h / 2);

    ctx.restore();
  }
}

export default Item;
