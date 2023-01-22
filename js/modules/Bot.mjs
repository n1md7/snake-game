import {Snake} from "./Snake.mjs";
import {MathUtils} from "./utils/MathUtils.mjs";
import {Speed} from "./Speed.mjs";

export class Bot extends Snake {
  /** @type {Number} */
  #id = -1;

  /**
   * @param {Grid} grid
   * @param {Number} point
   * @param {Speed} speed
   * @param {String} color
   */
  constructor(grid, point, speed, color) {
    const body = [...MathUtils.getListNumbers(point, point + 5)];
    super(body, grid, speed, color);
  }

  run() {
    if (this.blocks.size <= 1) this.stop();
    const random = MathUtils.getRandomInt(0, 3);
    if (random === 0) this.goUp();
    if (random === 1) this.goDown();
    if (random === 2) this.goLeft();
    if (random === 3) this.goRight();
    random ? this.decreaseSpeed() : this.increaseSpeed();
    this.#id = setTimeout(this.run.bind(this), MathUtils.getRandomInt(1500, 8000));
  }

  stop() {
    clearTimeout(this.#id);
  }
}
