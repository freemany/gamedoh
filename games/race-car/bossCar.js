import { drawShape, isCollision } from './gamedoh-engine.js';
import { bossSprite } from './images.js';
import { BLOCK_SIZE, CANVAS_HEIGHT, BOSS_POSITIONS } from './constants.js';

const TRACK_EVERY = 60; // frames between lane shifts
const SLIDE_SPEED = 2; // grid units per frame when sliding

class BossCar {
  constructor(game) {
    this.game = game;
    this.width = 20; // grid units
    this.height = 12; // grid units
    this._positionIndex = 1; // start centered
    this.x = BOSS_POSITIONS[1];
    this._targetX = this.x;
    this.y = -(this.height + 8); // enter from above
    this._trackTick = 0;
  }

  update() {
    this.y += this.game.speed * 0.5;

    // recycle to top when it exits the bottom
    if (this.y * BLOCK_SIZE > CANVAS_HEIGHT) {
      this.y = -(this.height + 8);
    }

    // shift toward player lane every TRACK_EVERY frames
    this._trackTick++;
    if (this._trackTick >= TRACK_EVERY) {
      this._trackTick = 0;
      const playerLane = this.game.playerCar.lane;
      if (playerLane < this._positionIndex && this._positionIndex > 0) {
        this._positionIndex--;
        this._targetX = BOSS_POSITIONS[this._positionIndex];
      } else if (playerLane > this._positionIndex && this._positionIndex < 2) {
        this._positionIndex++;
        this._targetX = BOSS_POSITIONS[this._positionIndex];
      }
    }

    // slide smoothly toward target x
    if (this.x < this._targetX) this.x = Math.min(this.x + SLIDE_SPEED, this._targetX);
    else if (this.x > this._targetX) this.x = Math.max(this.x - SLIDE_SPEED, this._targetX);

    // collision: bounce back to top, player loses a life
    if (isCollision(this, this.game.playerCar)) {
      this.y = -(this.height + 8);
      this.game.loseLife();
    }
  }

  draw(ctx) {
    drawShape(
      ctx,
      this.game.blockSize,
      bossSprite,
      this.x * this.game.blockSize,
      this.y * this.game.blockSize
    );
  }
}

export default BossCar;
