import {MathUtils} from "./utils/MathUtils.mjs";

export class Food {
  /** @type {Number} */
  #id = -1;
  /** @type {Grid} */
  #grid;
  /** @type {Snake} */
  #snake;

  /**
   * @param {Grid} grid
   * @param {Snake} snake
   * */
  constructor(grid, snake) {
    this.#grid = grid;
    this.#snake = snake;
  }

  get id() {
    return this.#id;
  }

  generate() {
    const size = this.#grid.col * this.#grid.row;
    const reserved = new Set([...this.#grid.getLevelBlocks(), ...this.#snake.blocks]);
    const point = MathUtils.getRandomWithoutExcluded(0, size, reserved);
    const block = this.#grid.getBlockByLinearId(point);
    if (block) block.updateAsFood();
    this.#id = point;
  }
}
