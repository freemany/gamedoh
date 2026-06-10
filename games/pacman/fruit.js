import Shape from './shape.js';
import { isCollision, getRandom } from './utils.js';

const image = [
  ['_', '_', '_', '_', 'w', 'e', 'e', 'w', 'w', 'w'],
  ['_', '_', 'r', 'r', 'r', 'e', 'r', 'r', '_', '_'],
  ['_', 'r', 'r', 'r', 'r', 'e', 'r', 'r', 'r', '_'],
  ['r', 'r', 'r', 'r', 'e', 'e', 'r', 'r', 'r', 'r'],
  ['r', 'r', 'r', 'r', 'r', 'r', 'r', 'r', '_', 'r'],
  ['r', 'r', 'w', 'r', 'r', 'r', 'r', 'r', '_', 'r'],
  ['r', 'r', 'w', 'w', '_', 'r', 'r', 'r', 'r', 'r'],
  ['_', 'r', 'r', 'w', 'r', 'r', 'r', 'r', 'r', '_'],
  ['_', 'r', 'r', 'r', 'r', 'r', 'r', 'r', '_', '_'],
  ['_', '_', 'w', 'r', 'r', 'r', 'r', 'w', '_', '_'],
];

class Fruit extends Shape {
  constructor(game, fruitMap) {
    super(game, [[image]]);
    this.fruitMap = fruitMap;
    this._setPosition();
  }

  _setPosition() {
    const [x, y] = this.fruitMap[getRandom(this.fruitMap.length)];
    this.x = x;
    this.y = y;
  }

  update() {
    if (isCollision(this, this.game.pacman)) {
      this.game.board.score++;
      this._setPosition();
    }

    return this;
  }
}

export default Fruit;
