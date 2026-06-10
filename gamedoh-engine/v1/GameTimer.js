// GameTimer is driven by the game loop — call update() every tick.
// heartbeat: game loop interval in ms (e.g. 100)
// onTick(remaining): called each second with remaining time
// onExpire(): called when countdown reaches 0
class GameTimer {
  constructor(seconds, heartbeat, onTick, onExpire) {
    this.initSec = seconds;
    this.seconds = seconds;
    this.heartbeat = heartbeat;
    this.onTick = onTick;
    this.onExpire = onExpire;
    this.count = 0;
    this.stop = true;
  }

  start() {
    this.stop = false;
    if (this.onTick) this.onTick(this.seconds);
  }

  update() {
    if (this.stop) return;
    this.count += this.heartbeat;
    if (this.count < 1000) return;
    this.count -= 1000;

    this.seconds--;
    if (this.onTick) this.onTick(this.seconds);
    if (this.seconds <= 0) {
      this.pause();
      if (this.onExpire) this.onExpire();
    }
  }

  pause() {
    this.stop = true;
  }

  cancel() {
    this.stop = true;
    this.seconds = 0;
    this.count = 0;
  }

  restart() {
    this.seconds = this.initSec;
    this.count = 0;
    this.stop = false;
  }
}

export default GameTimer;
