import { Image, State, drawShape } from './gamedoh-engine.js';
import { GRAVITY, JUMP_FORCE, RUN, JUMP, DUCK, INVINCIBILITY_FRAMES } from './constants.js';

// ── Sprites (10 wide × 10 tall, d=black body) ────────────────────

const RUN_1 = [
  ['_', '_', '_', '_', 'd', 'd', 'd', 'd', '_', '_'],
  ['_', '_', '_', 'd', 'd', 'd', 'd', 'd', 'd', '_'],
  ['_', '_', '_', 'd', 'd', 'd', 'd', '_', '_', '_'],
  ['_', '_', '_', 'd', 'd', 'd', 'd', '_', '_', '_'],
  ['_', '_', 'd', 'd', 'd', 'd', 'd', 'd', 'd', '_'],
  ['d', 'd', 'd', 'd', 'd', 'd', 'd', '_', '_', '_'],
  ['_', 'd', 'd', 'd', 'd', 'd', '_', '_', '_', '_'],
  ['_', '_', '_', 'd', 'd', '_', '_', '_', '_', '_'],
  ['_', '_', 'd', 'd', '_', 'd', '_', '_', '_', '_'],
  ['_', 'd', 'd', '_', '_', 'd', 'd', '_', '_', '_'],
];

const RUN_2 = [
  ['_', '_', '_', '_', 'd', 'd', 'd', 'd', '_', '_'],
  ['_', '_', '_', 'd', 'd', 'd', 'd', 'd', 'd', '_'],
  ['_', '_', '_', 'd', 'd', 'd', 'd', '_', '_', '_'],
  ['_', '_', '_', 'd', 'd', 'd', 'd', '_', '_', '_'],
  ['_', '_', 'd', 'd', 'd', 'd', 'd', 'd', 'd', '_'],
  ['d', 'd', 'd', 'd', 'd', 'd', 'd', '_', '_', '_'],
  ['_', 'd', 'd', 'd', 'd', 'd', '_', '_', '_', '_'],
  ['_', '_', '_', 'd', 'd', '_', '_', '_', '_', '_'],
  ['_', '_', 'd', 'd', '_', 'd', '_', '_', '_', '_'],
  ['_', '_', '_', '_', '_', 'd', 'd', '_', '_', '_'],
];

const JUMP_IMG = [
  ['_', '_', '_', '_', 'd', 'd', 'd', 'd', '_', '_'],
  ['_', '_', '_', 'd', 'd', 'd', 'd', 'd', 'd', '_'],
  ['_', '_', '_', 'd', 'd', 'd', 'd', '_', '_', '_'],
  ['_', '_', '_', 'd', 'd', 'd', 'd', '_', '_', '_'],
  ['_', '_', 'd', 'd', 'd', 'd', 'd', 'd', 'd', '_'],
  ['d', 'd', 'd', 'd', 'd', 'd', 'd', '_', '_', '_'],
  ['_', 'd', 'd', 'd', 'd', 'd', '_', '_', '_', '_'],
  ['_', '_', 'd', 'd', 'd', 'd', '_', '_', '_', '_'],
  ['_', 'd', 'd', '_', '_', 'd', 'd', '_', '_', '_'],
  ['_', '_', '_', '_', '_', '_', '_', '_', '_', '_'],
];

const DUCK_1 = [
  ['_', '_', '_', '_', '_', '_', 'd', 'd', 'd', '_'],
  ['_', '_', '_', '_', 'd', 'd', 'd', 'd', 'd', 'd'],
  ['d', 'd', 'd', 'd', 'd', 'd', 'd', '_', '_', '_'],
  ['_', 'd', 'd', 'd', 'd', 'd', '_', '_', '_', '_'],
  ['_', 'd', 'd', '_', 'd', 'd', '_', '_', '_', '_'],
  ['_', 'd', 'd', '_', 'd', 'd', '_', '_', '_', '_'],
];

const DUCK_2 = [
  ['_', '_', '_', '_', '_', '_', 'd', 'd', 'd', '_'],
  ['_', '_', '_', '_', 'd', 'd', 'd', 'd', 'd', 'd'],
  ['d', 'd', 'd', 'd', 'd', 'd', 'd', '_', '_', '_'],
  ['_', 'd', 'd', 'd', 'd', 'd', '_', '_', '_', '_'],
  ['_', 'd', 'd', '_', 'd', 'd', '_', '_', '_', '_'],
  ['_', '_', '_', '_', 'd', 'd', 'd', '_', '_', '_'],
];

class RunState extends State {
  constructor(dino) {
    super(dino, RUN);
    this.image = new Image([RUN_1, RUN_2]);
    this._timer = 0;
  }
  enter() {
    this.image.index = 0;
    this._timer = 0;
  }
  getImage() {
    return this.image.getImage();
  }
  nextFrame() {
    if (++this._timer >= 8) {
      this._timer = 0;
      this.image.next();
    }
  }
}

class JumpState extends State {
  constructor(dino) {
    super(dino, JUMP);
    this.image = new Image([JUMP_IMG]);
  }
  enter() {
    this.entity.speedY = JUMP_FORCE;
    this.entity.grounded = false;
    this.entity.game.sounds.jump();
  }
  getImage() {
    return this.image.getImage();
  }
  nextFrame() {}
}

class DuckState extends State {
  constructor(dino) {
    super(dino, DUCK);
    this.image = new Image([DUCK_1, DUCK_2]);
    this._timer = 0;
  }
  enter() {
    this.image.index = 0;
    this._timer = 0;
  }
  getImage() {
    return this.image.getImage();
  }
  nextFrame() {
    if (++this._timer >= 6) {
      this._timer = 0;
      this.image.next();
    }
  }
}

class TRex {
  constructor(game) {
    this.game = game;
    this.states = {
      [RUN]: new RunState(this),
      [JUMP]: new JumpState(this),
      [DUCK]: new DuckState(this),
    };
    this.currentState = this.states[RUN];
    this.currentState.enter();
    this._updateSize();
    this.x = 15;
    this.speedY = 0;
    this.grounded = true;
    this.invincible = 0;
    this.y = this._groundLine();
  }

  _groundLine() {
    return this.game.height - this.game.groundHeight - this.height;
  }
  _updateSize() {
    const img = this.currentState.getImage();
    this.width = img[0].length;
    this.height = img.length;
  }

  enterState(state) {
    if (this.currentState.state === state) return;
    this.currentState = this.states[state];
    this.currentState.enter();
    this._updateSize();
    if (state !== JUMP) this.y = this._groundLine();
  }

  move(cmd) {
    if (cmd === 'jump' && this.grounded) this.enterState(JUMP);
    if (cmd === 'duck' && this.grounded) this.enterState(DUCK);
    if (cmd === 'release_duck' && this.currentState.state === DUCK) this.enterState(RUN);
    if (cmd === 'release_jump' && !this.grounded && this.speedY < 0) this.speedY *= 0.5;
  }

  update() {
    if (!this.grounded) {
      this.speedY += GRAVITY;
      this.y += this.speedY;
      const floor = this._groundLine();
      if (this.y >= floor) {
        this.y = floor;
        this.speedY = 0;
        this.grounded = true;
        this.enterState(RUN);
      }
    } else {
      this.y = this._groundLine();
    }
    if (this.invincible > 0) this.invincible--;
    this.currentState.nextFrame();
    return this;
  }

  draw(ctx) {
    // Blink every 5 frames while invincible
    if (this.invincible > 0 && Math.floor(this.invincible / 5) % 2 === 0) return this;
    drawShape(
      ctx,
      this.game.blockSize,
      this.currentState.getImage(),
      this.x * this.game.blockSize,
      this.y * this.game.blockSize
    );
    return this;
  }
}

export default TRex;
