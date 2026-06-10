import { CANVAS_WIDTH, FORM_COLS, CELL_W, FORM_GAP, FORM_TOP_Y, CELL_H } from './constants.js';

export function getFormationXY(col, row) {
  const totalW = FORM_COLS * CELL_W + FORM_GAP;
  const leftStart = (CANVAS_WIDTH - totalW) / 2;
  const x = col < 5
    ? leftStart + col * CELL_W + CELL_W / 2
    : leftStart + col * CELL_W + FORM_GAP + CELL_W / 2;
  const y = FORM_TOP_Y + row * CELL_H + CELL_H / 2;
  return { x, y };
}
