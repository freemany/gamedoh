/**
 * Returns a new 2D sprite array with color codes swapped per `map`.
 * Example: colorizeFrame(frame, { w: 'b' }) → white gi becomes blue gi
 * The CDN drawShape already maps: b→blue, r→red, w→white
 */
export function colorizeFrame(frame, map) {
  return frame.map(row => row.map(cell => map[cell] ?? cell));
}
