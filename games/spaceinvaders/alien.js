import { drawShape } from './utils.js';
import Image from './image.js';
import { Alive, Exploding, ALIVE, EXPLODING } from './alienStates.js';

const image = [
  ['_', '_', 'r', 'r', '_', '_'],
  ['_', 'r', 'r', 'r', 'r', '_'],
  ['r', 'r', 'r', 'r', 'r', 'r'],
  ['r', '_', '_', '_', '_', 'r'],
  ['r', '_', '_', '_', '_', 'r'],
];
const image1 = [
  ['_', '_', 'r', 'r', '_', '_'],
  ['_', 'r', 'r', 'r', 'r', '_'],
  ['r', 'r', 'r', 'r', 'r', 'r'],
  ['_', 'r', '_', '_', 'r', '_'],
  ['_', 'r', '_', '_', 'r', '_'],
];
const image2 = [
  ['_', '_', 'r', 'r', '_', '_'],
  ['_', 'r', 'r', 'r', 'r', '_'],
  ['r', 'r', 'r', 'r', 'r', 'r'],
  ['_', '_', 'r', 'r', '_', '_'],
  ['_', '_', 'r', 'r', '_', '_'],
];

class Alien {
  constructor({ x, y, game }) {
    this.image = new Image([image, image1, image2]);
    this.width = this.image.getWidth();
    this.height = this.image.getHeight();
    this.x = x;
    this.y = y;
    this.game = game;
    this.speed = 1;
    this.states = { [ALIVE]: new Alive(this), [EXPLODING]: new Exploding(this) };
    this.enterState(ALIVE);
  }

  enterState(state) {
    if (this.currentState?.state === state) return;
    this.currentState = this.states[state];
    this.currentState.enter();
  }

  update() {
    this.x += this.speed;
    if (this.x + this.width > this.game.width - 1) {
      this.speed = -1;
      this.x += this.speed;
    } else if (this.x < 0) {
      this.speed = 1;
      this.x += this.speed;
    }

    this.image.next();
    return this;
  }

  draw(ctx) {
    drawShape(
      ctx,
      this.game.blockSize,
      this.image.getImage(),
      this.x * this.game.blockSize,
      this.y * this.game.blockSize
    );
  }

  explode() {
    this.enterState(EXPLODING);
  }
}

export default Alien;
