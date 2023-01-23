import {Snake} from "./Snake.mjs";
import {MathUtils} from "./utils/MathUtils.mjs";
import {Speed} from "./Speed.mjs";

export class Bot extends Snake {
  /** @type {Number} */
  #id = -1;

  /**
   * @param {Grid} grid
   * @param {Number} spawnIndex
   * @param {Speed} speed
   * @param {Point} point
   * @param {String} color
   * @param {String} name
   */
  constructor(grid, spawnIndex, speed, point, color, name) {
    const body = [...MathUtils.getListNumbers(spawnIndex, spawnIndex + 5)];
    super(body, grid, speed, point, color, name);
  }

  get isBot() {
    return true;
  }

  run() {
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
