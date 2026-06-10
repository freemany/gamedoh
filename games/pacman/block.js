import Shape from './shape.js';

const image = [
  ['o', 'e', 'e', 'e', 'o', 'o', 'o', 'o', 'o', 'o'],
  ['o', 'o', 'o', 'o', 'o', 'o', 'd', 'd', 'e', 'e'],
  ['o', 'o', 'o', 'o', 'e', 'e', 'e', 'o', 'o', 'o'],
  ['o', 'd', 'd', 'o', 'o', 'o', 'o', 'o', 'o', 'o'],
  ['o', 'o', 'o', 'o', 'o', 'o', 'e', 'e', 'e', 'o'],
  ['o', 'o', 'o', 'd', 'd', 'd', 'd', 'd', 'o', 'o'],
  ['o', 'o', 'e', 'e', 'e', 'e', 'o', 'o', 'o', 'o'],
  ['o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'e'],
  ['o', 'd', 'd', 'd', 'o', 'e', 'e', 'e', 'o', 'o'],
  ['e', 'e', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o'],
];

class Block extends Shape {
  constructor(game, { x, y }) {
    super(game, [[image]]);
    this.x = x;
    this.y = y;
  }
}

export default Block;
