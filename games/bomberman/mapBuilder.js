import { shuffle } from './gamedoh-engine.js';
import {
  TILE_EMPTY,
  TILE_HARD,
  TILE_SOFT,
  SAFE_TILES,
  ITEM_BOMB_UP,
  ITEM_FIRE_UP,
  ITEM_HEART,
  ITEM_REMOTE,
  ITEM_PIERCE,
  ITEM_KEY,
  ITEM_EXIT,
} from './constants.js';

/**
 * Builds the initial grid of tile types.
 * Hard blocks: every tile where col % 2 === 1 && row % 2 === 1
 * Safe zone: always empty
 * Remaining: randomly fill ~softDensity fraction as SOFT
 */
export const buildGrid = (cols, rows, softDensity) => {
  const grid = [];

  for (let r = 0; r < rows; r++) {
    grid[r] = [];
    for (let c = 0; c < cols; c++) {
      if (c % 2 === 1 && r % 2 === 1) {
        grid[r][c] = TILE_HARD;
      } else {
        grid[r][c] = TILE_EMPTY;
      }
    }
  }

  // Enforce safe zone
  for (const [c, r] of SAFE_TILES) {
    if (r < rows && c < cols) grid[r][c] = TILE_EMPTY;
  }

  // Collect all tiles that can be soft (empty, non-safe)
  const safeSet = new Set(SAFE_TILES.map(([c, r]) => `${c},${r}`));
  const candidates = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] === TILE_EMPTY && !safeSet.has(`${c},${r}`)) {
        candidates.push([c, r]);
      }
    }
  }

  // Randomly fill softDensity fraction as soft blocks
  const softCount = Math.floor(candidates.length * softDensity);
  const shuffled = shuffle(candidates);
  for (let i = 0; i < softCount; i++) {
    const [c, r] = shuffled[i];
    grid[r][c] = TILE_SOFT;
  }

  return grid;
};

/**
 * Places hidden items under random soft blocks.
 * Returns a Map of "col,row" -> itemType for KEY, EXIT, and power-ups.
 */
export const placeHiddenItems = (grid, rows, cols, itemTypes = [ITEM_BOMB_UP, ITEM_FIRE_UP, ITEM_HEART, ITEM_REMOTE, ITEM_PIERCE]) => {
  const softTiles = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] === TILE_SOFT) {
        softTiles.push([c, r]);
      }
    }
  }

  const shuffled = shuffle(softTiles);
  const hidden = new Map();

  // Place each item type under a unique soft block
  const allTypes = [ITEM_KEY, ITEM_EXIT, ...itemTypes.filter(t => t !== ITEM_KEY && t !== ITEM_EXIT)];

  for (let i = 0; i < allTypes.length && i < shuffled.length; i++) {
    const [c, r] = shuffled[i];
    hidden.set(`${c},${r}`, allTypes[i]);
  }

  return hidden;
};
