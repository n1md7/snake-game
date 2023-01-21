export class Game {
  /** @type {Number} */
  #fps = 60;
  /** @type {Number} */
  #lastTick;
  /** @type {Number} */
  #lastUpdate;
  /** @type {Number} */
  #interval;
  /** @type {Boolean} */
  #ended = false;
  /** @type {Boolean} */
  #won = false;
  /** @type {Boolean} */
  #lost = false;
  /** @type {Grid} */
  #grid;
  /** @type {Snake} */
  #snake;
  /** @type {GameUI} */
  #canvas;
  /** @type {Speed} */
  #speed;

  /**
   * @param {Grid} grid
   * @param {Snake} snake
   * @param {GameUI} canvas
   * @param {Speed} speed
   */
  constructor(grid, snake, canvas, speed) {
    this.#grid = grid;
    this.#snake = snake;
    this.#canvas = canvas;
    this.#speed = speed;
    this.#interval = 1000 / this.#fps;
    this.#lastTick = 0;
    this.#lastUpdate = 0;
  }

  get isEnded() {
    return this.#ended;
  }

  get isWon() {
    return this.#won;
  }

  get isLost() {
    return this.#lost;
  }

  get level() {
    return this.#grid.level;
  }

  setWon() {
    this.#won = true;
    this.setEnded();
  }

  setLost() {
    this.#lost = true;
    this.setEnded();
  }

  setEnded() {
    this.#ended = true;
  }

  reset() {
    this.#won = false;
    this.#ended = false;
    this.#lost = false;
    this.#grid.reset();
    this.#snake.reset();
    this.#canvas.reset();
    this.#speed.reset();
  }

  /**
   * @param {Number} level
   */
  setLevel(level) {
    this.#grid.setLevel(level);
  }

  run() {
    this.#loop(0);
  }

  /**
   * @param {Number} currentTick
   */
  #loop(currentTick) {
    const delta = currentTick - this.#lastTick;
    if (delta > this.#interval) {
      this.#lastTick = currentTick;
      if (this.#update(currentTick)) return void 0;
    }

    window.requestAnimationFrame(this.#loop.bind(this));
  }

  /**
   * @param {Number} currentTick
   */
  #update(currentTick) {
    const delta = currentTick - this.#lastUpdate;
    if (delta > this.#speed.current) {
      this.#lastUpdate = currentTick;
      if (!this.#snake.canMove()) this.setLost();
      if (this.#ended) {
        if (this.#won) this.#handleGameWon();
        if (this.#lost) this.#handleGameLost();
        return true; // Signal to Exit
      }

      this.#snake.accelerateRequested ?
        this.#speed.increase() : this.#speed.decrease();

      this.#snake.removeTail();
      this.#snake.appendHead();
      for (const block of this.#snake) {
        block.updateAsBody();
      }
    }
  }

  #handleGameLost() {
    console.log('You LOST', 'cause:', this.#snake.status);
    this.#canvas.showLooser();
  }

  #handleGameWon() {
    console.log('You WON');
    this.#canvas.showWinner();
  }
}
