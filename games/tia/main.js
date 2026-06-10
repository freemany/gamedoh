import Game from './game.js';
import { drawGrid } from './utils.js';
import inputHandler from './inputHandler.js';
import Tia from './tia.js';

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const blockSize = 5;
const gameWidth = canvas.width / blockSize;
const gameHeight = canvas.height / blockSize;

const game = new Game(ctx);
game.blockSize = blockSize;
game.width = gameWidth;
game.height = gameHeight;

const tia = new Tia(game, { x: 10, y: 20 });

inputHandler(tia.move.bind(tia));

game.frames = 0;

const intervalId = setInterval(() => {
  game.frames++;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawGrid(ctx, gameWidth, gameHeight, blockSize);
  tia.update().draw(ctx);
}, 90);
game.intervalId = intervalId;
