import { shuffle } from './utils.js';
import inputHandler from './inputHandler.js';
import Alien from './alien.js';
import SpaceShip from './spaceShip.js';
import Game from './game.js';
import ScoreBoard from './scoreBoard.js';
import { LEVELS, allienInitPositions } from './constants.js';

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const blockSize = 10;
const gameWidth = canvas.width / blockSize;
const gameHeight = canvas.height / blockSize;

const game = new Game(ctx, { canvas });
game.blockSize = blockSize;
game.width = gameWidth;
game.height = gameHeight;

const createSpaceShip = () => {
  const spaceShip = new SpaceShip({ x: 0, y: gameHeight - 6, game });
  game.spaceShip = spaceShip;
  return spaceShip;
};

const setupAliens = (alienCount) => {
  const positions = shuffle(allienInitPositions);
  game.aliens = Array.from(Array(alienCount).keys()).map(
    (i) => new Alien({ x: positions[i][0], y: positions[i][1], game })
  );
};

const setupGame = () => {
  setupAliens(LEVELS[0]);
  createSpaceShip();
  game.scoreBoard = new ScoreBoard(game, { x: 2, y: 3 });
};

setupGame();
inputHandler(
  (dir) => game.spaceShip.move(dir),
  () => game.spaceShip.shoot()
);
game.onRestart = setupGame;
game.onLevelSetup = (alienCount) => setupAliens(alienCount);

// Preload assets
const loadAssets = () =>
  new Promise((resolve) => {
    if (document.readyState === 'complete') {
      resolve();
    } else {
      window.addEventListener('load', resolve);
    }
  });
(async () => {
  await loadAssets();
  document.getElementById('loading').style.display = 'none';
  game.init();
})();
