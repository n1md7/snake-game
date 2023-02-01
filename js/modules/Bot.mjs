import {Snake} from "./Snake.mjs";
import {MathUtils} from "./utils/MathUtils.mjs";
import {Speed} from "./Speed.mjs";
import {Direction} from "./Direction.mjs";
import {delay} from "./utils/utils.mjs";

export class Bot extends Snake {
  /** @type {Grid} */
  #grid;
  /** @type {number} */
  #lastUpdate = Date.now();
  /** @type {number | null} */
  _moves = null
  /** @type {{col: Number, row: Number, idx: Number} | null} */
  _target = null;

  /**
   * @param {Grid} grid
   * @param {Number} spawnIndex
   * @param {Speed} speed
   * @param {Point} point
   * @param {String} color
   * @param {String} name
   */
  constructor(grid, spawnIndex, speed, point, color, name) {
    const rand = 9;//MathUtils.getRandomInt(0, 128);
    const body = MathUtils.numberList(spawnIndex + rand, spawnIndex + rand + 3);
    super(body, grid, speed, point, color, name);
    this.#grid = grid;
  }

  get isBot() {
    return true;
  }

  run(now = Date.now()) {
    if (this.status !== Snake.Status.Active || !this.isEnabled) return;
    const delta = now - this.#lastUpdate;
    const next = this.nextIndex();
    this._target ||= this.find(8);
    if (this._target) {
      this.increaseSpeed();
      this._moves ||= Math.abs(next.col - this._target.col) + Math.abs(next.row - this._target.row);
      if (next.row > this._target.row) this.goUp();
      else if (next.row < this._target.row) this.goDown();
      else if (next.col > this._target.col) this.goLeft();
      else if (next.col < this._target.col) this.goRight();
      if (--this._moves <= 0) {
        this._target = null;
        this._moves = null;
      }
    } else {
      this.decreaseSpeed();
      if (delta > 8000) {
        this.#lastUpdate = now;
        const random = MathUtils.getRandomInt(0, 3);
        if (random === 0) this.goUp();
        if (random === 1) this.goDown();
        if (random === 2) this.goLeft();
        if (random === 3) this.goRight();
      }
    }

    return delay(this.speed.current / 2).then(() => this.run(Date.now()));
  }

  /**
   * @param { {row: Number, col: Number}} next
   */
  #defineNextMove(next) {
    switch (this.direction) {
      case Direction.Type.Down:
      case Direction.Type.Up:
        const leftBlock = this.#grid.getBlockByXY(next.row + (Direction.Type.Down === this.direction ? -1 : +1), next.col - 1);
        const rightBlock = this.#grid.getBlockByXY(next.row + (Direction.Type.Up === this.direction ? +1 : -1), next.col + 1);
        if (!leftBlock.isWall() || !leftBlock.isBody()) this.goLeft(true);
        else if (!rightBlock.isWall() || !rightBlock.isBody()) this.goRight(true);
        break;
      case Direction.Type.Right:
      case Direction.Type.Left:
        const upBlock = this.#grid.getBlockByXY(next.row - 1, next.col + (Direction.Type.Right === this.direction ? -1 : +1));
        const downBlock = this.#grid.getBlockByXY(next.row + 1, next.col + (Direction.Type.Left === this.direction ? +1 : -1));
        if (!upBlock.isWall() || !upBlock.isBody()) this.goUp(true);
        else if (!downBlock.isWall() || !downBlock.isBody()) this.goRight(true);
    }
  }

  /**
   * @description Find food coordinates if there is one nearby
   * @param {Number} [depth = 5] how far can run the DFS
   * @returns {{col: Number, row: Number, idx: Number} | null}
   */
  find(depth = 5) {
    /** @type {Set<Number>} */
    const visited = new Set();
    const next = this.nextIndex();
    /** @type {{row: Number, col: Number, level: Number}[]} */
    const stack = [{row: next.row, col: next.col, level: 0}];
    while (stack.length > 0) {
      const {row, col, level} = stack.pop();
      const idx = this.#grid.getLinearIdx(row, col);
      if (visited.has(idx) || level > depth) continue;
      const block = this.#grid.getBlockByLinearId(idx);
      if (!block) continue;
      if (block.isFood()) return {row, col, idx: this.#grid.getLinearIdx(row, col)};
      block.updateAsTest();
      delay(300).then(() => block.resetTest());
      if (this.direction === Direction.Type.Right) {
        Array.prototype.push.apply(stack, [
          {row: row - 1, col: col + 1, level: level + 1},
          {row: row * 1, col: col + 1, level: level + 1},
          {row: row + 1, col: col + 1, level: level + 1},
        ]);
      } else if (this.direction === Direction.Type.Left) {
        Array.prototype.push.apply(stack, [
          {row: row - 1, col: col - 1, level: level + 1},
          {row: row * 1, col: col - 1, level: level + 1},
          {row: row + 1, col: col - 1, level: level + 1},
        ]);
      } else if (this.direction === Direction.Type.Up) {
        Array.prototype.push.apply(stack, [
          {row: row - 1, col: col - 1, level: level + 1},
          {row: row - 1, col: col * 1, level: level + 1},
          {row: row - 1, col: col + 1, level: level + 1},
        ]);
      } else if (this.direction === Direction.Type.Down) {
        Array.prototype.push.apply(stack, [
          {row: row + 1, col: col - 1, level: level + 1},
          {row: row + 1, col: col * 1, level: level + 1},
          {row: row + 1, col: col + 1, level: level + 1},
        ]);
      }
      visited.add(idx);
    }

    return null;
  }

  reset() {
    this._target = null;
    this._moves = null;
    super.reset();
  }

  stop() {
    super.stop();
  }
}
