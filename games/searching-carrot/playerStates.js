import { State, Image } from './gamedoh-engine.js';
import {
  BUNNY_IDLE_1,
  BUNNY_IDLE_2,
  BUNNY_UP,
  BUNNY_DOWN,
  BUNNY_LEFT,
  BUNNY_RIGHT,
} from './bunnyImage.js';
import { IDLE, UP, DOWN, LEFT, RIGHT, EAT } from './constants.js';

const runAudio = document.getElementById('runAudio');
const eatAudio = document.getElementById('eatAudio');

export const stopRunAudio = () => {
  runAudio.loop = false;
  runAudio.pause();
};

export class IdleState extends State {
  constructor(player) {
    super(player, IDLE);
    this.image = new Image([BUNNY_IDLE_1, BUNNY_IDLE_2]);
  }

  enter() {
    runAudio.loop = false;
    runAudio.pause();
  }

  getImage()  { return this.image.getImage(); }
  nextFrame() { this.image.next(); }
}

export class UpState extends State {
  constructor(player) {
    super(player, UP);
    this.image = new Image([BUNNY_UP]);
  }

  enter() {
    runAudio.loop = true;
    runAudio.play().catch(() => {});
  }

  getImage()  { return this.image.getImage(); }
  nextFrame() { this.image.next(); }
}

export class DownState extends State {
  constructor(player) {
    super(player, DOWN);
    this.image = new Image([BUNNY_DOWN]);
  }

  enter() {
    runAudio.loop = true;
    runAudio.play().catch(() => {});
  }

  getImage()  { return this.image.getImage(); }
  nextFrame() { this.image.next(); }
}

export class LeftState extends State {
  constructor(player) {
    super(player, LEFT);
    this.image = new Image([BUNNY_LEFT]);
  }

  enter() {
    runAudio.loop = true;
    runAudio.play().catch(() => {});
  }

  getImage()  { return this.image.getImage(); }
  nextFrame() { this.image.next(); }
}

export class RightState extends State {
  constructor(player) {
    super(player, RIGHT);
    this.image = new Image([BUNNY_RIGHT]);
  }

  enter() {
    runAudio.loop = true;
    runAudio.play().catch(() => {});
  }

  getImage()  { return this.image.getImage(); }
  nextFrame() { this.image.next(); }
}

export class EatState extends State {
  constructor(player) {
    super(player, EAT);
    this.image = new Image([BUNNY_IDLE_1]);
  }

  enter() {
    runAudio.pause();
    eatAudio.currentTime = 0;
    eatAudio.play().catch(() => {});
    eatAudio.addEventListener('ended', () => this.entity.enterState(IDLE), { once: true });
  }

  getImage()  { return this.image.getImage(); }
  nextFrame() { this.image.next(); }
}
