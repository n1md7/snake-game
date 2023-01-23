export class Point {
  /** @type {Number} */
  #point;
  /**
   * @param {Number} delay
   * @returns {void}
   */
  #callback;

  /**
   * @param {Number} point
   */
  constructor(point = 0) {
    this.#point = point;
  }

  get point() {
    return this.#point;
  }

  valueOf() {
    return this.#point;
  }

  increment() {
    this.#point++;
    if (typeof this.#callback === 'function') this.#callback(this.#point);
  }

  decrement() {
    this.#point--;
    if (typeof this.#callback === 'function') this.#callback(this.#point);
  }

  /**
   * @param {Function} fn
   */
  onBroadcast(fn) {
    this.#callback = fn;
  }
}
