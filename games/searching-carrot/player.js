import { drawShape } from './gamedoh-engine.js';
import { WORLD_WIDTH, WORLD_HEIGHT, BUNNY_SPEED, BUNNY_HALF_W, BUNNY_HALF_H, IDLE, UP, DOWN, LEFT, RIGHT, EAT } from './constants.js';
import { IdleState, UpState, DownState, LeftState, RightState, EatState } from './playerStates.js';

class Player {
  constructor(game) {
    this.game = game;
    // Start at world center
    this.worldX = WORLD_WIDTH / 2;
    this.worldY = WORLD_HEIGHT / 2;
    this.states = {
      [IDLE]: new IdleState(this),
      [UP]: new UpState(this),
      [DOWN]: new DownState(this),
      [LEFT]: new LeftState(this),
      [RIGHT]: new RightState(this),
      [EAT]: new EatState(this),
    };
    this.enterState(IDLE);
  }

  enterState(state) {
    if (this.currentState?.state === state) return;
    this.currentState = this.states[state];
    this.currentState.enter();
  }

  move(dir) {
    switch (dir) {
      case 'u':
        this.worldY = Math.max(BUNNY_HALF_H, this.worldY - BUNNY_SPEED);
        this.enterState(UP);
        break;
      case 'd':
        this.worldY = Math.min(WORLD_HEIGHT - BUNNY_HALF_H, this.worldY + BUNNY_SPEED);
        this.enterState(DOWN);
        break;
      case 'l':
        this.worldX = Math.max(BUNNY_HALF_W, this.worldX - BUNNY_SPEED);
        this.enterState(LEFT);
        break;
      case 'r':
        this.worldX = Math.min(WORLD_WIDTH - BUNNY_HALF_W, this.worldX + BUNNY_SPEED);
        this.enterState(RIGHT);
        break;
    }
    this.game.camera.follow(this.worldX, this.worldY);
  }

  get halfW() { return Math.floor(this.currentState.getImage()[0].length / 2); }
  get halfH() { return Math.floor(this.currentState.getImage().length / 2); }

  idle() {
    this.enterState(IDLE);
  }

  eat() {
    this.enterState(EAT);
  }

  update() {
    this.currentState.nextFrame();
  }

  draw(ctx) {
    const { blockSize, camera } = this.game;
    const image = this.currentState.getImage();
    const spriteW = image[0].length * blockSize;
    const spriteH = image.length * blockSize;
    // Bunny is centred on its world position, converted to screen via camera
    const screenX = (this.worldX - camera.x) * blockSize - spriteW / 2;
    const screenY = (this.worldY - camera.y) * blockSize - spriteH / 2;
    drawShape(ctx, blockSize, image, screenX, screenY);
  }
}

export default Player;
