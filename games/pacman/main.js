import Game from './game.js';
import { drawGrid } from './utils.js';
import inputHandler from './inputHandler.js';
import Pacman from './pacman.js';
import { buildMaze, fruitMap } from './helper.js';
import Ghost from './ghost.js';
import ScoreBoard from './scoreBoard.js';
import Fruit from './fruit.js';

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const blockSize = 5;
const gameWidth = canvas.width / blockSize;
const gameHeight = canvas.height / blockSize;

const game = new Game(ctx);
game.blockSize = blockSize;
game.width = gameWidth;
game.height = gameHeight;
game.pacmanStart = { x: 40, y: 30 };

const pacman = new Pacman(game, { x: game.pacmanStart.x, y: game.pacmanStart.y });
game.pacman = pacman;

game.fruit = new Fruit(game, fruitMap);

game.maze = buildMaze(game);
game.ghosts = [
  new Ghost(game, { x: 10, y: 10, xSpeed: 1, ySpeed: 0 }),
  //new Ghost(game, {x: 70, y: 30, xSpeed: 1, ySpeed: 0}),
  new Ghost(game, { x: 20, y: 50, xSpeed: 1, ySpeed: 0 }),
  new Ghost(game, { x: 30, y: 70, xSpeed: -1, ySpeed: 0 }),
  new Ghost(game, { x: 10, y: 10, xSpeed: 0, ySpeed: -1 }),
  //new Ghost(game, {x: 30, y: 30, xSpeed: 0, ySpeed: 1}),
  new Ghost(game, { x: 50, y: 50, xSpeed: 0, ySpeed: -1 }),
  //new Ghost(game, {x: 70, y: 70, xSpeed: 0, ySpeed: 1}),
  new Ghost(game, { x: 90, y: 30, xSpeed: 0, ySpeed: -1 }),
  //new Ghost(game, {x: 110, y: 40, xSpeed: 0, ySpeed: 1}),
];
game.board = { life: 3, score: 0 };
const scoreBoard = new ScoreBoard(game, { x: 11, y: 14 });

inputHandler(pacman.move.bind(pacman));

game.frames = 0;

const intervalId = setInterval(() => {
  game.frames++;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawGrid(ctx, gameWidth, gameHeight, blockSize);
  game.maze.forEach((block) => block.update().draw(ctx));
  game.pacman.update().draw(ctx);
  game.ghosts.forEach((ghost) => ghost.update().draw(ctx));
  game.fruit.update().draw(ctx);
  scoreBoard.update().draw(ctx);
  if (game.board.life === 0) {
    game.over();
  }
}, 90);
game.intervalId = intervalId;
