import { drawShape } from './gamedoh-engine.js';
import { ROCK_A, ROCK_B, ROCK_C } from './rockImage.js';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from './constants.js';

const variants = [ROCK_A, ROCK_B, ROCK_C];

class Rock {
  constructor(game, worldX, worldY, variant) {
    this.game = game;
    this.worldX = worldX;
    this.worldY = worldY;
    this.image = variants[variant % variants.length];
  }

  draw(ctx) {
    const { blockSize, camera } = this.game;
    const screenX = (this.worldX - camera.x) * blockSize;
    const screenY = (this.worldY - camera.y) * blockSize;
    // Skip if off screen
    if (screenX < -40 || screenX > CANVAS_WIDTH + 40) return;
    if (screenY < -40 || screenY > CANVAS_HEIGHT + 40) return;
    drawShape(ctx, blockSize, this.image, screenX, screenY);
  }
}

export default Rock;
