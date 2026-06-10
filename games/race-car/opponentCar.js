import { drawShape, isCollision, getRandomNumber } from './gamedoh-engine.js';
import { opponentVariants } from './images.js';
import { CANVAS_HEIGHT, BLOCK_SIZE, LANE_POSITIONS, OPPONENT_SPACING } from './constants.js';

class OpponentCar {
  constructor(game, laneIndex, variantIndex, yOffset = 0) {
    this.game = game;
    this.width = 10; // grid units
    this.height = 12; // grid units
    this._setup(laneIndex, variantIndex, yOffset);
  }

  _setup(laneIndex, variantIndex, yOffset) {
    this.lane = laneIndex;
    this.x = LANE_POSITIONS[laneIndex];
    this.y = -(this.height + yOffset);
    this._image = opponentVariants[variantIndex % opponentVariants.length];
  }

  _recycle() {
    const lane = getRandomNumber(3);
    const variant = getRandomNumber(opponentVariants.length);
    this._setup(lane, variant, getRandomNumber(OPPONENT_SPACING));
  }

  update() {
    this.y += this.game.speed;

    // passed player — give score and recycle
    if (this.y * BLOCK_SIZE > CANVAS_HEIGHT) {
      this._recycle();
      this.game.addScore(1);
      return;
    }

    // collision with player car
    if (isCollision(this, this.game.playerCar)) {
      this._recycle();
      this.game.loseLife();
    }
  }

  draw(ctx) {
    drawShape(
      ctx,
      this.game.blockSize,
      this._image,
      this.x * this.game.blockSize,
      this.y * this.game.blockSize
    );
    return this;
  }
}

export default OpponentCar;
