// Timer counts down from `seconds` to 0, calling `onTick(remaining)` each second.
// Returns a Promise that resolves when the countdown reaches 0.
class Timer {
  constructor(seconds) {
    this.seconds = seconds;
  }

  start(onTick) {
    return new Promise((resolve) => {
      let remaining = this.seconds;
      if (onTick) onTick(remaining);
      this._interval = setInterval(() => {
        remaining--;
        if (remaining <= 0) {
          clearInterval(this._interval);
          resolve();
        } else {
          if (onTick) onTick(remaining);
        }
      }, 1000);
    });
  }

  cancel() {
    clearInterval(this._interval);
  }
}

export default Timer;
