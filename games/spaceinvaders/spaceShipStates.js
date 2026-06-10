const shootSound = document.getElementById('shootSound');

const IDLE = 'IDLE';
const SHOOTING = 'SHOOTING';

class State {
  constructor(spaceShip, state) {
    this.spaceShip = spaceShip;
    this.state = state;
  }
  enter() {}
}

class Idle extends State {
  constructor(spaceShip) {
    super(spaceShip, IDLE);
  }
}

class Shooting extends State {
  constructor(spaceShip) {
    super(spaceShip, SHOOTING);
  }

  enter() {
    shootSound.currentTime = 0;
    shootSound.play();
  }
}

export { Idle, Shooting, IDLE, SHOOTING };
