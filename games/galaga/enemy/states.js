import { State, Image } from '../gamedoh-engine.js';
import {
  zakozokoFrame1, zakozokoFrame2,
  goeiFrame1, goeiFrame2,
  bossFrame1, bossFrame2, bossDamagedFrame1,
  explodeFrame1, explodeFrame2, explodeFrame3,
} from './images.js';
import { TYPE_ZAKOZAKO, TYPE_GOEI, TYPE_BOSS, PLAYER_Y } from '../constants.js';

export const ENTERING   = 'ENTERING';
export const FORMATION  = 'FORMATION';
export const DIVING     = 'DIVING';
export const TRACTOR    = 'TRACTOR';
export const RETURNING  = 'RETURNING';
export const DEAD       = 'DEAD';

function makeImage(type, damaged = false) {
  if (type === TYPE_BOSS) {
    return damaged
      ? new Image([bossDamagedFrame1, bossFrame2])
      : new Image([bossFrame1, bossFrame2]);
  }
  if (type === TYPE_GOEI) return new Image([goeiFrame1, goeiFrame2]);
  return new Image([zakozokoFrame1, zakozokoFrame2]);
}

export class EnteringState extends State {
  constructor(entity) {
    super(entity, ENTERING);
    this.image = makeImage(entity.type);
    this._timer = 0;
  }
  enter() {
    this.image.index = 0;
    this._timer = 0;
    this.entity._waypointIndex = 0;
  }
  getImage() { return this.image.getImage(); }
  nextFrame() {
    if (++this._timer >= 8) { this._timer = 0; this.image.next(); }
    this.entity._stepTowardWaypoint(this.entity._entryPath, 3.5, FORMATION);
  }
}

export class FormationState extends State {
  constructor(entity) {
    super(entity, FORMATION);
    this.image = makeImage(entity.type, entity._damaged);
    this._timer = 0;
  }
  enter() {
    this.image = makeImage(this.entity.type, this.entity._damaged);
    this.image.index = 0;
    this._timer = 0;
  }
  getImage() { return this.image.getImage(); }
  nextFrame() {
    if (++this._timer >= 12) { this._timer = 0; this.image.next(); }
  }
}

export class DivingState extends State {
  constructor(entity) {
    super(entity, DIVING);
    this.image = makeImage(entity.type, entity._damaged);
    this._timer = 0;
  }
  enter() {
    this.image = makeImage(this.entity.type, this.entity._damaged);
    this.image.index = 0;
    this._timer = 0;
    this.entity._waypointIndex = 0;
  }
  getImage() { return this.image.getImage(); }
  nextFrame() {
    if (++this._timer >= 6) { this._timer = 0; this.image.next(); }
    this.entity._stepTowardWaypoint(this.entity._divePath, this.entity.diveSpeed, RETURNING);
  }
}

export class TractorState extends State {
  constructor(entity) {
    super(entity, TRACTOR);
    this.image = makeImage(entity.type, entity._damaged);
    this._timer = 0;
    this._hoverTimer = 0;
    this._hovering = false;
  }
  enter() {
    this.image = makeImage(this.entity.type, this.entity._damaged);
    this.image.index = 0;
    this._timer = 0;
    this._hoverTimer = 0;
    this._hovering = false;
    this.entity._waypointIndex = 0;
  }
  getImage() { return this.image.getImage(); }
  nextFrame() {
    if (++this._timer >= 6) { this._timer = 0; this.image.next(); }
    const e = this.entity;
    if (!this._hovering) {
      // Move toward hover position above player
      const targetY = PLAYER_Y - 100;
      const targetX = e._tractorTargetX;
      const dx = targetX - e.x;
      const dy = targetY - e.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 4) {
        e.x = targetX;
        e.y = targetY;
        this._hovering = true;
      } else {
        const speed = e.diveSpeed;
        e.x += (dx / dist) * speed;
        e.y += (dy / dist) * speed;
      }
    } else {
      // Hovering — emit tractor beam; game checks fighter position
      this._hoverTimer++;
      if (this._hoverTimer > 180) {
        // Timeout after 3s — dive away
        e._divePath = [
          { x: e.x, y: e.y + 70 },
          { x: e.formationX, y: e.formationY },
        ];
        e.enterState(DIVING);
      }
    }
  }
}

export class ReturningState extends State {
  constructor(entity) {
    super(entity, RETURNING);
    this.image = makeImage(entity.type, entity._damaged);
    this._timer = 0;
  }
  enter() {
    this.image = makeImage(this.entity.type, this.entity._damaged);
    this.image.index = 0;
    this._timer = 0;
  }
  getImage() { return this.image.getImage(); }
  nextFrame() {
    if (++this._timer >= 8) { this._timer = 0; this.image.next(); }
    const e = this.entity;
    const tx = e.formationX;
    const ty = e.formationY;
    const dx = tx - e.x;
    const dy = ty - e.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 4) {
      e.x = tx; e.y = ty;
      e.enterState(FORMATION);
    } else {
      const speed = e.diveReturnSpeed;
      e.x += (dx / dist) * speed;
      e.y += (dy / dist) * speed;
    }
  }
}

export class DeadState extends State {
  constructor(entity) {
    super(entity, DEAD);
    this.image = new Image([explodeFrame1, explodeFrame2, explodeFrame3]);
    this._timer = 0;
  }
  enter() { this.image.index = 0; this._timer = 0; }
  getImage() { return this.image.getImage(); }
  nextFrame() {
    this._timer++;
    if (this._timer % 5 === 0) this.image.next();
    if (this._timer >= 20) this.entity.alive = false;
  }
}
