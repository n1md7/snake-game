import {Food} from "./Food.mjs";

export class Game {
  /** @type {Number} */
  #fps = 60;
  /** @type {Number} */
  #lastTick;
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
  /** @type {Food} */
  #food;
  /** @type {Point} */
  #point;

  /**
   * @param {Grid} grid
   * @param {Snake} snake
   * @param {GameUI} canvas
   * @param {Food} food
   * @param {Point} point
   * @param {Snake[]} bots
   */
  constructor(grid, snake, canvas, food, point, bots) {
    this.#grid = grid;
    this.#snake = snake;
    this.#canvas = canvas;
    this.#interval = 1000 / this.#fps;
    this.#lastTick = 0;
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

  /** @param {Number} currentTick */
  #update(currentTick) {
    for (const snake of [this.#snake, ...this.#bots]) {
      if (snake.needsUpdate(currentTick)) {
        if (!this.#snake.canMove()) this.setLost();
        if (this.#ended) {
          if (this.#won) this.#handleGameWon();
          if (this.#lost) this.#handleGameLost();
          return true; // Signal to Exit
        }

        this.#handleSnakeSpeed(snake);
        this.#handleSnakeEatFood(snake);
        this.#handleSnakeRender(snake);
      }
    }
  }

  /** @param {Snake} snake */
  #handleSnakeSpeed(snake) {
    if (snake.accelerateRequested) {
      return snake.speed.increase();
    }
    snake.speed.decrease();
  }

  /** @param {Snake} snake */
  #handleSnakeEatFood(snake) {
    if (this.#food.ids.has(snake.headId)) {
      // 🐍 eats 🍔
      this.#food.ids.delete(snake.headId);
      this.#food.generate(2);
      // FIXME point is shared, should be bound with snakes
      this.#point.increment();
      snake.addTailBlock();
    }
  }

  /** @param {Snake} snake */
  #handleSnakeRender(snake) {
    snake.removeTail();
    snake.appendHead();
    for (const block of snake) {
      block.updateAsBody();
    }
  }

  #handleGameLost() {
    console.log('You LOST', 'cause:', this.#snake.status);
    this.#canvas.showLooser();
    const nextBlock = this.#snake.nextBlock();
    if (nextBlock) nextBlock.updateAsBump();
  }

  #handleGameWon() {
    console.log('You WON');
    this.#canvas.showWinner();
  }
}
