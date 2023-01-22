import {Food} from "./Food.mjs";

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
  /** @type {Snake[]} */
  #bots;
  /** @type {GameUI} */
  #canvas;
  /** @type {Speed} */
  #speed;
  /** @type {Food} */
  #food;
  /** @type {Point} */
  #point;

  /**
   * @param {Grid} grid
   * @param {Snake} snake
   * @param {GameUI} canvas
   * @param {Speed} speed
   * @param {Food} food
   * @param {Point} point
   * @param {Snake[]} bots
   */
  constructor(grid, snake, canvas, speed, food, point, bots) {
    this.#grid = grid;
    this.#snake = snake;
    this.#canvas = canvas;
    this.#speed = speed;
    this.#interval = 1000 / this.#fps;
    this.#lastTick = 0;
    this.#lastUpdate = 0;
    this.#food = food;
    this.#point = point;
    this.#bots = bots;
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
    this.#updateOnce();
    this.#loop();
  }

  /**
   * @param {Number} [currentTick = 0]
   */
  #loop(currentTick = 0) {
    const delta = currentTick - this.#lastTick;
    if (delta > this.#interval) {
      this.#lastTick = currentTick;
      if (this.#update(currentTick)) return void 0;
    }

    window.requestAnimationFrame(this.#loop.bind(this));
  }

  /**
   * @description Initial update, runs only once per start/reset.
   */
  #updateOnce() {
    this.#food.generate();
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

      this.#handleSnakeSpeed();
      this.#handleSnakeEatFood();
      this.#handleSnakeRender();
    }
  }

  #handleSnakeSpeed() {
    if (this.#snake.accelerateRequested) {
      return this.#speed.increase();
    }
    this.#speed.decrease();
  }

  #handleSnakeEatFood() {
    if (this.#snake.headId === this.#food.id) {
      // 🐍 eats 🍔
      this.#food.generate();
      this.#point.increment();
      this.#snake.addTailBlock();
    }
  }

  #handleSnakeRender() {
    for (const snake of [this.#snake, ...this.#bots]) {
      snake.removeTail();
      snake.appendHead();
      for (const block of snake) {
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
