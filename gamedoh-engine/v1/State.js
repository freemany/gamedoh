class State {
  constructor(entity, state) {
    this.entity = entity;
    this.state = state;
  }

  // Called once when entering this state. Override for side effects (sound, flags, etc.)
  enter() {}

  // Override to return the sprite frame array for this state.
  getImage() {}

  // Override to return a gravity modifier for physics-based entities.
  getGravity() {}
}

// enterState guard — add this method to your entity class:
//
// enterState(state) {
//   if (this.currentState?.state === state) return;
//   this.currentState = this.states[state];
//   this.currentState.enter();
// }

export default State;
