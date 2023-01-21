import {Grid} from "./Grid.mjs";
import {Direction} from "./Direction.mjs";

export class Snake {
  static Status = {
    Active: 'Active',
    DeadByWall: 'DeadByWall',
    DeadByBody: 'DeadByBody',
    DeadByMapOverflow: 'DeadByMapOverflow',
  };
  /** @typedef {Set<Number>} Blocks */

  /** @type {Number[]}*/
  #initialBlocks = [];
  /** @type {Blocks}*/
  #blocks = new Set();
  /** @type {Direction} */
  #direction = null;
  /** @type {Grid} */
  #grid = null;
  /** @type {Number} */
  #blockHeadIdx;
  /** @type {Block} */
  #blockHeadRef;
  /** @type {Snake.Status} */
  #status = Snake.Status.Active;
  /** @type {Boolean} */
  #accelerate = false;

  /**
   * @param {Number[]} blocks
   * @param {Grid} grid
   */
  constructor(blocks, grid) {
    this.#grid = grid;
    this.#initialBlocks = Array.from(blocks);

    this.reset();
  }

  get status() {
    return this.#status;
  }

  get accelerateRequested() {
    return this.#accelerate;
  }

  increaseSpeed() {
    this.#accelerate = true;
  }

  decreaseSpeed() {
    this.#accelerate = false;
  }

  /** @returns {{row: Number, col: Number}} */
  #nextIndex() {
    const {row, col} = this.#grid.get2dIdx(this.#blockHeadIdx);
    const move = {
      Left: {row, col: col - 1},
      Right: {row, col: col + 1},
      Up: {row: row - 1, col},
      Down: {row: row + 1, col},
    };

    return move[this.#direction.peek()];
  }

  /** @param {Direction.Type} direction */
  #setDirection(direction) {
    this.#direction.add(direction);
  }

  goLeft() {
    this.#setDirection(Direction.Type.Left);
  }

  goRight() {
    this.#setDirection(Direction.Type.Right);
  }

  goUp() {
    this.#setDirection(Direction.Type.Up);
  }

  goDown() {
    this.#setDirection(Direction.Type.Down);
  }

  * [Symbol.iterator]() {
    for (const idx of this.#blocks) {
      yield this.#grid.getBlockByLinearId(idx);
    }
  }

  removeTail() {
    // Get and remove 1st item from set of Blocks
    const [tailIndex] = this.#blocks;
    this.#blocks.delete(tailIndex);
    const block = this.#grid.getBlockByLinearId(tailIndex);
    block.updateAsEmpty();
  }

  appendHead() {
    if (!this.canMove()) return;
    const next = this.#nextIndex();
    const linearIdx = this.#grid.getLinearIdx(next.row, next.col);
    this.#blocks.add(linearIdx);
    this.#blockHeadIdx = linearIdx;
    this.#blockHeadRef.setIsHead(false);
    this.#blockHeadRef = this.#grid.getBlockByLinearId(linearIdx);
    this.#blockHeadRef.setIsHead(true);
    this.#direction.removeLast()
  }

  /** @returns {boolean} */
  canMove() {
    const next = this.#nextIndex();
    const nextBlock = this.#grid.getBlockByXY(next.row, next.col);
    if (!nextBlock) {
      this.#status = Snake.Status.DeadByMapOverflow;
      return false;
    }

    if (nextBlock.isBody()) this.#status = Snake.Status.DeadByBody;
    if (nextBlock.isWall()) this.#status = Snake.Status.DeadByWall;

    return !(nextBlock.isBody() || nextBlock.isWall());
  }

  reset() {
    this.#blocks = new Set(this.#initialBlocks);
    this.#blockHeadIdx = this.#initialBlocks.at(-1);
    this.#blockHeadRef = this.#grid.getBlockByLinearId(this.#blockHeadIdx);
    this.#direction = new Direction();
    this.#accelerate = false;
  }
}
