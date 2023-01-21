import {MathUtils} from "./utils/MathUtils.mjs";

export class Levels {
  /** @returns {Set<Number>} */
  static get Level01() {
    return new Set();
  }

  /** @returns {Set<Number>} */
  static get Level02() {
    const blocks = new Set();

    for(const block of MathUtils.getListNumbers(101, 122)) blocks.add(block);
    for(const block of MathUtils.getListNumbers(645, 666)) blocks.add(block);

    for(let block = 144; block <= 624; block += 32) blocks.add(block);
    for(let block = 143; block <= 624; block += 32) blocks.add(block);

    return blocks;
  }

  /** @returns {Set<Number>} */
  static get Level03() {
    const blocks = new Set([...Levels.Level02]);

    blocks.add(133);
    blocks.add(165);
    blocks.add(154);
    blocks.add(186);
    blocks.add(581);
    blocks.add(613);
    blocks.add(602);
    blocks.add(634);

    blocks.delete(368);
    blocks.delete(400);
    blocks.delete(367);
    blocks.delete(399);

    return blocks;
  }
}
