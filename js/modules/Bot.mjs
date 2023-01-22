import {Snake} from "./Snake.mjs";
import {MathUtils} from "./utils/MathUtils.mjs";

export class Bot extends Snake {
  /** @type {Number} */
  #id = -1;

  /**
   * @param {Grid} grid
   * @param {Number} point
   */
  constructor(grid, point) {
    const body = [... MathUtils.getListNumbers(point, point + 5)];
    super(body, grid);
  }

  run() {
    if(this.blocks.size <= 1) this.stop();
    const random = MathUtils.getRandomInt(0, 3);
    if (random === 0) this.goUp();
    if (random === 1) this.goDown();
    if (random === 2) this.goLeft();
    if (random === 3) this.goRight();
    this.#id = setTimeout(this.run.bind(this), MathUtils.getRandomInt(1500, 8000));
  }

  stop() {
    clearTimeout(this.#id);
  }
}
