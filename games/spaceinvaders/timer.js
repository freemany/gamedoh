import { HEART_BEAT } from './constants.js';

class GameTimer {
  constructor(seconds, onTick, onExpire) {
    this.stop = true;
    this.initSec = seconds;
    this.seconds = seconds;
    this.onTick = onTick;
    this.onExpire = onExpire;
    this.count = 0;
  }

  start() {
    this.stop = false;
    this.onTick(this.seconds);
  }

  update() {
    this.count += HEART_BEAT;
    if (this.count < 1000 || this.count % 1000 > 0) return this;

    if (!this.stop) {
      this.seconds--;
    }
    if (this.onTick) this.onTick(this.seconds);
    if (!this.stop && this.seconds <= 0) {
      this.pause();
      if (this.onExpire) this.onExpire();
    }
  }

  cancel() {
    this.seconds = 0;
    this.count = 0;
  }

  pause() {
    this.stop = true;
  }

  restart() {
    this.seconds = this.initSec;
  }

  getTime() {
    return this.seconds;
  }
}

export default GameTimer;
