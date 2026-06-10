/**
 * Camera — 2D scrolling viewport for large worlds.
 *
 * Stores the top-left corner of the viewport in world units.
 * Call follow() each frame to keep an entity centred on screen,
 * clamped so the camera never shows outside the world boundary.
 *
 * Units can be pixels or grid units — use whichever your game uses
 * consistently for worldWidth/viewWidth and entity positions.
 */
class Camera {
  /**
   * @param {object} opts
   * @param {number} opts.worldWidth  - Total world width in world units
   * @param {number} opts.worldHeight - Total world height in world units
   * @param {number} opts.viewWidth   - Viewport width in world units
   * @param {number} opts.viewHeight  - Viewport height in world units
   */
  constructor({ worldWidth, worldHeight, viewWidth, viewHeight }) {
    this._ww = worldWidth;
    this._wh = worldHeight;
    this._vw = viewWidth;
    this._vh = viewHeight;
    this.x = 0; // world units — left edge of viewport
    this.y = 0; // world units — top edge of viewport
  }

  /**
   * Centre the viewport on (worldX, worldY), clamped to world edges.
   * When clamped, the target can keep moving toward the edge on screen.
   *
   * @param {number} worldX - Target x in world units
   * @param {number} worldY - Target y in world units
   */
  follow(worldX, worldY) {
    this.x = Math.max(0, Math.min(this._ww - this._vw, worldX - this._vw / 2));
    this.y = Math.max(0, Math.min(this._wh - this._vh, worldY - this._vh / 2));
  }

  /** Reset viewport to the world origin (top-left). */
  reset() {
    this.x = 0;
    this.y = 0;
  }
}

export default Camera;
