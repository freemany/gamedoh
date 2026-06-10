import { drawShape } from './utils.js';
import Image from './image.js';
import Bullet from './bullet.js';
import { BULLET_SLOWDOWN_BY_TICK, MAX_BULLET_COUNT } from './constants.js';
import { Idle, Shooting, IDLE, SHOOTING } from './spaceShipStates.js';

const image = [
  ['_', '_', '_', 'r', '_', '_', '_'],
  ['_', '_', '_', 'r', '_', '_', '_'],
  ['_', '_', 'r', 'r', 'r', '_', '_'],
  ['b', 'b', 'r', 'r', 'r', 'b', 'b'],
  ['b', 'b', 'b', 'r', 'b', 'b', 'b'],
];

class SpaceShip {
  constructor({ x, y, game }) {
    this.image = new Image([image]);
    this.width = this.image.getWidth();
    this.height = this.image.getHeight();
    this.x = x;
    this.y = y;
    this.game = game;
    this.maxBullet = MAX_BULLET_COUNT;
    this.bullets = [];
    this.states = { [IDLE]: new Idle(this), [SHOOTING]: new Shooting(this) };
    this.enterState(IDLE);
  }

  enterState(state) {
    if (this.currentState?.state === state) return;
    this.currentState = this.states[state];
    this.currentState.enter();
  }

  update() {
    this.bullets = this.bullets.filter((b) => !b.deleted);

    return this;
  }

  draw(ctx) {
    this.bullets.forEach((bullet) => {
      bullet.update().draw(ctx);
    });
    drawShape(
      ctx,
      this.game.blockSize,
      this.image.getImage(),
      this.x * this.game.blockSize,
      this.y * this.game.blockSize
    );
  }

  move(dir) {
    switch (dir) {
      case 'u':
        if (this.y === 0) return;
        // this.y -= 1;
        break;
      case 'd':
        if (this.y + this.height === this.game.height - 1) return;
        // this.y += 1;
        break;
      case 'l':
        if (this.x === 0) return;
        this.x -= 1;
        break;
      case 'r':
        if (this.x + this.width === this.game.width - 1) return;
        this.x += 1;
        break;
      default:
        break;
    }
    this.image.next();
  }

  shoot() {
    if (this.bullets.length >= this.maxBullet) return;
    if (this.game.tick % BULLET_SLOWDOWN_BY_TICK > 0) return;
    this.enterState(SHOOTING);
    this.enterState(IDLE);
    const bullet = new Bullet(this.game, this.x + (this.width - 1) / 2, this.y);
    this.bullets.push(bullet);
  }
}

export default SpaceShip;
