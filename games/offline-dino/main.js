import Game from './game.js';
import TRex from './tRex.js';
import Obstacle from './obstacle.js';
import Bird from './bird.js';
import Ground from './ground.js';
import Clouds from './clouds.js';
import ScoreBoard from './scoreBoard.js';
import inputHandler from './inputHandler.js';
import { OBSTACLE_COUNT, BIRD_COUNT, OBSTACLE_SPACING } from './constants.js';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const game = new Game(ctx, { canvas });

const setupGame = () => {
  game.tRex = new TRex(game);

  game.obstacles = [];
  for (let i = 0; i < OBSTACLE_COUNT; i++) {
    const x = game.width + i * OBSTACLE_SPACING;
    game.obstacles.push(new Obstacle(game, x));
  }

  game.birds = [];
  for (let i = 0; i < BIRD_COUNT; i++) {
    const x = Math.round(game.width * 1.5) + i * Math.round(OBSTACLE_SPACING * 1.5);
    game.birds.push(new Bird(game, x));
  }

  game.ground = new Ground(game);
  game.clouds = new Clouds(game);
  game.scoreBoard = new ScoreBoard(game);
};

const resetEntities = () => {
  game.obstacles = [];
  for (let i = 0; i < OBSTACLE_COUNT; i++) {
    const x = game.width + i * OBSTACLE_SPACING;
    game.obstacles.push(new Obstacle(game, x));
  }
  game.birds = [];
  for (let i = 0; i < BIRD_COUNT; i++) {
    const x = Math.round(game.width * 1.5) + i * Math.round(OBSTACLE_SPACING * 1.5);
    game.birds.push(new Bird(game, x));
  }
};

setupGame();
game.onRestart    = setupGame;
game.onLevelSetup = resetEntities;

inputHandler(game);

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
  document.getElementById('gameCanvas').style.display = 'block';
  game.init();
})();
