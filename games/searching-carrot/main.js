import Game from './game.js';
import inputHandler from './inputHandler.js';
import Player from './player.js';
import Rock from './rock.js';
import Carrot from './carrot.js';
import { getRandomNumber } from './gamedoh-engine.js';
import { ROCK_COUNT, WORLD_WIDTH, WORLD_HEIGHT } from './constants.js';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const game = new Game(ctx, { canvas });

const setupRocks = () => {
  game.rocks = Array.from(
    { length: ROCK_COUNT },
    (_, i) => new Rock(game, getRandomNumber(WORLD_WIDTH), getRandomNumber(WORLD_HEIGHT), i)
  );
};

const setupGame = () => {
  game.player = new Player(game);
  game.camera.follow(WORLD_WIDTH / 2, WORLD_HEIGHT / 2);
  setupRocks();
  game.carrots = [];
  game._pendingLevelStart = true;
};

game.onLevelSetup = () => {
  game.carrots = Array.from({ length: game.level.carrotCount }, () => new Carrot(game));
};

game.onRestart = () => {
  game.level.reset();
  setupGame();
};

inputHandler(game);
setupGame();

const loadAssets = () =>
  new Promise((resolve) => {
    if (document.readyState === 'complete') resolve();
    else window.addEventListener('load', resolve);
  });

(async () => {
  await loadAssets();
  document.getElementById('loading').style.display = 'none';
  document.getElementById('gameCanvas').style.display = 'block';
  game.init();
})();
