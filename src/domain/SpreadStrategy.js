import {List, Range} from 'immutable'
import {Order} from "./Order"


export class SpreadStrategy {
  static fixed(depth, amount, step) { return new FixedSpread(depth, amount, step) }

  generateOrdersFor(price, assets) { throw new TypeError("Must override method") }
}


class FixedSpread extends SpreadStrategy {
  constructor(depth, amount, step) {
    super()
    this._depth = depth
    this._amount = amount
    this._step = step
  }

  get depth() { return this._depth }
  get amount() { return this._amount }
  get step() { return this._step }

  generateOrdersFor(price, assets) {
    return Range(1, this.depth + 1).flatMap(i =>
      List.of(
        Order.ask(this.amount, price + (i * this.step), assets),
        Order.bid(this.amount, price - (i * this.step), assets)
      )
    ).toList()
  }
}



