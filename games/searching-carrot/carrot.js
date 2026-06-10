import { drawShape, getRandomNumber } from './gamedoh-engine.js';
import { WORLD_WIDTH, WORLD_HEIGHT } from './constants.js';
import { CARROT_IMAGE } from './carrotImage.js';

class Carrot {
  constructor(game) {
    this.game = game;
    this.respawn();
  }

  respawn() {
    // Small margin keeps the carrot sprite from clipping the world boundary line
    const margin = 5;
    this.worldX = margin + getRandomNumber(WORLD_WIDTH  - margin * 2);
    this.worldY = margin + getRandomNumber(WORLD_HEIGHT - margin * 2);
  }

  get halfW() { return Math.floor(CARROT_IMAGE[0].length / 2); }
  get halfH() { return Math.floor(CARROT_IMAGE.length / 2); }

  draw(ctx) {
    const { blockSize, camera } = this.game;
    const screenX = (this.worldX - camera.x) * blockSize;
    const screenY = (this.worldY - camera.y) * blockSize;
    drawShape(ctx, blockSize, CARROT_IMAGE, screenX, screenY);
  }
}

export default Carrot;
