import {Block} from "./Block.mjs";
import {GridUtils} from "./utils/GridUtils.mjs";
import {Levels} from "./Levels.mjs";

export class Grid extends GridUtils {
  /** @type {Block[][]} */
  #grid = null;
  /** @type {GameUI} */
  #gameUI = null;
  /** @type {Number} */
  #level = 1;
  /** @type {Number} */
  #block = 10;

  /**
   * @param {Number} row
   * @param {Number} col
   * @param {Number} block
   * @param {GameUI} gameUI
   */
  constructor(row, col, block, gameUI) {
    super(row, col);
    this.#block = block;
    this.#gameUI = gameUI;

    this.#populateEmptyGrid();
    this.#updateGridWithBlocks();
  }

  get level() {
    return this.#level;
  }

  #populateEmptyGrid() {
    this.#grid = Array(this.row).fill(0).map(() => Array(this.col).fill(0));
  }

  #updateGridWithBlocks() {
    const levelBlocks = this.#getLevel();
    for (const [rowIdx, row] of this.#grid.entries()) {
      for (const colIdx of row.keys()) {
        const block = new Block(this.#gameUI, this.#block);
        this.#grid[rowIdx][colIdx] = block;
        const index = this.getLinearIdx(rowIdx, colIdx);
        block.setIndex(index);
        if (levelBlocks.has(index)) block.setType(Block.type.Wall);
        else block.setType(Block.type.Empty);
        block.render();
      }
    }
  }

  #getLevel() {
    if (this.#level === 1) return Levels.Level01;
    if (this.#level === 2) return Levels.Level02;
    if (this.#level === 3) return Levels.Level03;
    return Levels.Level03;
  }

  /** @param {Number} level */
  setLevel(level) {
    this.#level = level;
    this.reset();
  }

  /**
   @param {Number} row
   @param {Number} col
   @returns {Block | null}
   */
  getBlockByXY(row, col) {
    const block = this.#grid?.[row]?.[col];
    if(block) return block;

    return this.#grid?.[row]?.[col];
  }

  /**
   @param {Number} idx
   @returns {Block | null}
   */
  getBlockByLinearId(idx) {
    const {row, col} = this.get2dIdx(idx);
    return this.#grid?.[row]?.[col];
  }

  reset() {
    this.#gameUI.clearBlocks();
    this.#populateEmptyGrid();
    this.#updateGridWithBlocks();
  }
}
