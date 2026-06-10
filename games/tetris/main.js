import Game from './game.js';
import Board from './board.js';
import inputHandler from './inputHandler.js';
import { CANVAS_WIDTH, CANVAS_HEIGHT, DROP_FRAMES_START } from './constants.js';

const canvas = document.getElementById('gameCanvas');
canvas.width  = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;
const ctx = canvas.getContext('2d');

const game = new Game(ctx, { canvas });

const setupGame = () => {
  game.board        = new Board();
  game.nextType     = null;           // will be set by first spawnPiece call
  game.linesCleared = 0;
  game._dropTimer    = 0;
  game._dropInterval = DROP_FRAMES_START;
  game._gameOver    = false;
  game.piece        = game.spawnPiece();
};

setupGame();
game.onRestart    = setupGame;
game.onLevelSetup = setupGame; // not used in Tetris but wired for safety

inputHandler(game);

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
