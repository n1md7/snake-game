export class MathUtils {
  /**
   * @description Gets random integer between the range (inclusive)
   * @param {Number} from
   * @param {Number} to
   */
  static getRandomInt(from, to) {
    return Math.random() * (to - from) + from;
  }

  /**
   * @description Generates number iterator between the range (inclusive)
   * @param {Number} from
   * @param {Number} to
   * @returns {Symbol.iterator}
   */
  static* getListNumbers(from, to) {
    for (let i = from; i <= to; i++) yield i;
  }

  /**
   * @param {Number} value
   * @param {Number} percent
   */
  static percent(value, percent){
    return value * percent / 100;
  }
}
