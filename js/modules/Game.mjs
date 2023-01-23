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
  #player;
  /** @type {Snake} */
  #actionTarget;
  /** @type {Snake[]} */
  #bots;
  /** @type {GameUI} */
  #canvas;
  /** @type {Food} */
  #food;
  /** @type {Number} */
  #pointToWin = 1;

  /**
   * @param {Grid} grid
   * @param {Snake} player
   * @param {GameUI} canvas
   * @param {Food} food
   * @param {Snake[]} bots
   */
  constructor(grid, player, canvas, food, bots) {
    this.#grid = grid;
    this.#player = player;
    this.#canvas = canvas;
    this.#interval = 1000 / this.#fps;
    this.#lastTick = 0;
    this.#food = food;
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

  /**
   * @param {Number} points
   */
  setPointsToWin(points) {
    this.#pointToWin = points
  }

  /** @param {Snake} snake */
  setWon(snake) {
    this.#won = true;
    this.#actionTarget = snake;
    this.setEnded();
  }

  /** @param {Snake | Bot} snake */
  setLost(snake) {
    // When Bot loses just remove the freaking snake
    if (snake.isBot) {
      // FIXME, snake parts still on the grid
      snake.stop();
      this.#removeBodyOf(snake);
      const index = this.#bots.findIndex((bot) => bot.id === snake.id);
      console.log(`${snake.name} has fallen on the battlefield - 😞`, index, this.#bots);
      if (index !== -1) this.#bots.splice(index, 1);
      return;
    }
    // Or evaluate player
    this.#lost = true;
    this.#actionTarget = snake;
    this.setEnded();
  }

  setEnded() {
    this.#ended = true;
  }

  reset() {
    this.#won = false;
    this.#ended = false;
    this.#lost = false;
    this.#actionTarget = null;
    this.#grid.reset();
    this.#player.reset();
    this.#canvas.reset();
  }

  /** @param {Number} level */
  setLevel(level) {
    this.#grid.setLevel(level);
  }

  run() {
    this.#updateOnce();
    this.#loop();
  }

  /** @param {Number} [currentTick = 0] */
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
    for (const snake of [this.#player, ...this.#bots]) {
      if (this.#pointToWin === snake.points.point) this.setWon(snake);
      if (snake.needsUpdate(currentTick)) {
        if (!snake.canMove()) this.setLost(snake);
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
      snake.points.increment();
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
    console.log(`Snake "${this.#actionTarget.name}" has LOST`, 'cause:', this.#actionTarget.status);
    this.#canvas.showLooser();
    const nextBlock = this.#actionTarget.nextBlock();
    if (nextBlock) nextBlock.updateAsBump();
  }

  #handleGameWon() {
    alert(`Winner is ${this.#actionTarget.name}`)
    this.#canvas.showWinner();
  }

  /** @param {Snake} snake */
  #removeBodyOf(snake){
    for(const piece of snake) {
      // FIXME, something is odd, not being updated as food
      piece.updateAsFood();
    }
  }
}
