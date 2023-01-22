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
  /** @type {Speed} */
  #speed = null;
  /** @type {Number} */
  #blockHeadIdx;
  /** @type {Block} */
  #blockHeadRef;
  /** @type {Snake.Status} */
  #status = Snake.Status.Active;
  /** @type {Boolean} */
  #accelerate = false;
  /** @type {Number} */
  #snacksToDigest = 0;
  /**
   * @param {Number} delay
   * @returns {void}
   */
  #callback;
  /** @type {Number} - determines when to tick next */
  #lastUpdate;
  /** @type {String} - Head color */
  #color;

  /**
   * @param {Number[]} blocks
   * @param {Grid} grid
   * @param {Speed} speed
   * @param {String} color
   */
  constructor(blocks, grid, speed, color) {
    this.#grid = grid;
    this.#speed = speed;
    this.#initialBlocks = Array.from(blocks);
    this.#lastUpdate = 0;
    this.#color = color;

    this.reset();
  }

  get color() {
    return this.#color;
  }

  get speed() {
    return this.#speed;
  }

  get headId() {
    return this.#blockHeadIdx;
  }

  get blocks() {
    return this.#blocks;
  }

  get status() {
    return this.#status;
  }

  get accelerateRequested() {
    return this.#accelerate;
  }

  /** @param {Number} currentTick */
  needsUpdate(currentTick) {
    const delta = currentTick - this.#lastUpdate;
    if (delta > this.speed.current) {
      this.#lastUpdate = currentTick;
      return true;
    }

    return false;
  }

  increaseSpeed() {
    this.#accelerate = true;
  }

  decreaseSpeed() {
    this.#accelerate = false;
  }

  /**
   * @param {Number} [weight = 1] - Food weight, 1 = 1 Block
   */
  addTailBlock(weight = 1) {
    this.#snacksToDigest += weight;
    if (typeof this.#callback === 'function') this.#callback(this.#blocks.size + weight);
  }

  /** @returns {{row: Number, col: Number}} */
  #nextIndex() {
    const direction = this.#direction.peek();
    let {row, col} = this.#grid.get2dIdx(this.#blockHeadIdx);

    {
      // Allow to teleport between the edges
      if (direction === Direction.Type.Left && col === 0) col = this.#grid.col;
      if (direction === Direction.Type.Right && col === this.#grid.col - 1) col = -1;
      if (direction === Direction.Type.Up && row === 0) row = this.#grid.row;
      if (direction === Direction.Type.Down && row === this.#grid.row - 1) row = -1;
    }

    const move = {
      Left: {row, col: col - 1},
      Right: {row, col: col + 1},
      Up: {row: row - 1, col},
      Down: {row: row + 1, col},
    };

    return move[direction];
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
    // Do not remove Snake block while snacks in the stomach 🤪
    if (this.#snacksToDigest > 0) return this.#snacksToDigest--;
    // Get and remove 1st item from set of Blocks
    const [tailIndex] = this.#blocks;
    this.#blocks.delete(tailIndex);
    const block = this.#grid.getBlockByLinearId(tailIndex);
    if (block) block.updateAsEmpty();
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
    this.#blockHeadRef.setBackgroundColor(this.#color);
    this.#direction.removeLast();
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

  /**
   * @param {Function} fn
   */
  onBroadcast(fn) {
    this.#callback = fn;
  }

  /**
   * @returns {Block|null}
   */
  nextBlock() {
    const next = this.#nextIndex();
    return this.#grid.getBlockByXY(next.row, next.col);
  }

  reset() {
    this.#blocks = new Set(this.#initialBlocks);
    this.#blockHeadIdx = this.#initialBlocks.at(-1);
    this.#blockHeadRef = this.#grid.getBlockByLinearId(this.#blockHeadIdx);
    this.#direction = new Direction();
    this.#accelerate = false;
    this.#speed.reset();
    if (typeof this.#callback === 'function') this.#callback(this.#blocks.size);
  }
}
