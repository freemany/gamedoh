const hitSound = document.getElementById('shootExplosion');

const ALIVE = 'ALIVE';
const EXPLODING = 'EXPLODING';

class State {
  constructor(alien, state) {
    this.alien = alien;
    this.state = state;
  }
  enter() {}
}

class Alive extends State {
  constructor(alien) {
    super(alien, ALIVE);
  }
}

class Exploding extends State {
  constructor(alien) {
    super(alien, EXPLODING);
  }

  enter() {
    hitSound.currentTime = 0;
    hitSound.play();
    this.alien.deleted = true;
  }
}

export { Alive, Exploding, ALIVE, EXPLODING };
