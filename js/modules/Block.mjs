export class Block {
  static type = Object.freeze({
    Empty: 'empty',
    Food: 'food',
    Wall: 'wall',
    Body: 'body',
    Head: 'head',
  });

  /** @type {Block.type | null} */
  #type = null;
  /** @type {Number | ''} */
  #index = '';
  /** @type {HTMLElement | null} */
  #block = null;
  /** @type {GameUI | null} */
  #gameUI = null;
  /** @type {Boolean} */
  #isHead = false;
  /** @type {Number} */
  #blockWH = 10;

  /**
   * @param {GameUI} gameUI
   * @param {Number} blockWH
   * @param {Block.type} [type = Block.type.Empty]
   *
   * @returns Block
   */
  constructor(gameUI, blockWH, type = Block.type.Empty) {
    this.#gameUI = gameUI;
    this.#type = type;
    this.#blockWH = blockWH;

    this.#create();
  }

  #create() {
    this.#block = document.createElement('div');
    this.#block.style.setProperty('width', this.#blockWH + 'px');
    this.#block.style.setProperty('height', this.#blockWH + 'px');
    this.#block.style.setProperty('line-height', this.#blockWH + 'px');
    this.#block.classList.add('block');
  }

  /**
   * @param {Number} idx
   */
  setDataIdx(idx) {
    this.#block.setAttribute('data-idx', idx + '');
  }

  /** @param {Block.type} type */
  setType(type) {
    this.#type = type;
  }

  /** @param {Number} index */
  setIndex(index) {
    this.#index = index;
  }

  /** @param {Boolean} state */
  setIsHead(state) {
    this.#isHead = state;
  }

  updateAsEmpty() {
    this.setType(Block.type.Empty);
    this.update();
  }

  updateAsBody() {
    this.setType(Block.type.Body);
    this.update();
  }

  updateAsFood() {
    this.setType(Block.type.Food);
    this.update();
  }

  isBody() {
    return this.#type === Block.type.Body;
  }

  isWall() {
    return this.#type === Block.type.Wall;
  }

  update() {
    this.#block.classList.remove(
      Block.type.Empty,
      Block.type.Food,
      Block.type.Wall,
      Block.type.Body,
      Block.type.Head,
    );
    // this.#block.innerText = this.#index;
    if (this.#isHead) this.#block.classList.add(Block.type.Head);
    if (this.#type === Block.type.Empty) return this.#block.classList.add(Block.type.Empty);
    if (this.#type === Block.type.Body) return this.#block.classList.add(Block.type.Body);
    if (this.#type === Block.type.Wall) return this.#block.classList.add(Block.type.Wall);
    if (this.#type === Block.type.Food) return this.#block.classList.add(Block.type.Food);
  }

  render() {
    this.update();
    this.#gameUI.appendBlock(this.#block);
  }
}
