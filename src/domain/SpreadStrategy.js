import {List, Range} from 'immutable'
import Order from './Order'


export default class SpreadStrategy {
  static fixed(depth, amount, step) { return new FixedSpread(depth, amount, step) }

  generateOrdersFor(price, currencies) { throw new TypeError('Must override method') }
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

  generateOrdersFor(price, currencies) {
    return Range(1, this.depth + 1).flatMap(i =>
      List.of(
        Order.ask(this.amount, price + (i * this.step), currencies),
        Order.bid(this.amount, price - (i * this.step), currencies)
      )
    ).toList()
  }
}



