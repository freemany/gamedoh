const CANNON_RIGHT = [
  ['e','e','e','e','e','e','e','e','e','e','e','e','e','e','e','e','e','e','e','e'],
  ['e','d','d','d','d','d','d','d','d','d','d','d','d','d','d','d','d','d','e','e'],
  ['e','d','l','l','l','l','l','l','l','l','l','l','l','l','d','l','l','d','e','e'],
  ['e','d','l','l','l','d','d','d','d','d','d','d','d','d','l','d','l','d','e','e'],
  ['e','d','l','d','d','d','l','l','l','l','l','l','l','d','l','l','l','d','e','e'],
  ['e','d','d','d','l','l','l','l','l','d','d','l','l','d','l','l','l','d','e','e'],
  ['e','d','l','l','l','d','d','l','l','l','l','l','l','d','l','l','l','d','e','e'],
  ['e','d','l','d','l','d','r','l','l','l','l','l','l','d','d','d','d','d','d','d'],
  ['e','d','l','d','l','d','r','l','l','r','r','r','l','l','l','r','l','l','d','d'],
  ['e','d','l','d','l','d','r','l','l','r','r','r','l','l','l','r','l','l','d','d'],
  ['e','d','l','d','l','d','r','l','l','r','r','r','l','l','l','r','l','l','d','d'],
  ['e','d','l','d','l','d','r','l','l','l','l','l','l','d','d','d','d','d','d','d'],
  ['e','d','l','l','l','d','d','l','l','l','l','l','l','d','l','l','l','d','e','e'],
  ['e','d','d','d','l','l','l','l','l','d','d','l','l','d','l','l','l','d','e','e'],
  ['e','d','l','d','d','d','l','l','l','l','l','l','l','d','l','l','l','d','e','e'],
  ['e','d','l','l','l','d','d','d','d','d','d','d','d','d','l','d','l','d','e','e'],
  ['e','d','l','l','l','l','l','l','l','l','l','l','l','l','d','l','l','d','e','e'],
  ['e','d','l','l','l','l','l','l','l','l','l','l','l','l','l','l','l','d','e','e'],
  ['e','d','d','d','d','d','d','d','d','d','d','d','d','d','d','d','d','d','e','e'],
  ['e','e','e','e','e','e','e','e','e','e','e','e','e','e','e','e','e','e','e','e'],
];

const _T  = g => g[0].map((_, j) => g.map(row => row[j]));          // transpose
const _RR = g => g.map(row => [...row].reverse());                   // reverse each row
const _RC = g => [...g].reverse();                                   // reverse row order

export const CANNON_UP    = _RC(_T(CANNON_RIGHT));   // 90° CCW — barrel points up
export const CANNON_LEFT  = _RC(_RR(CANNON_RIGHT));  // 180°    — barrel points left
export const CANNON_DOWN  = _RR(_T(CANNON_RIGHT));   // 90° CW  — barrel points down
export { CANNON_RIGHT };
