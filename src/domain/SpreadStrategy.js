import {List, Range} from 'immutable'
import Order from './Order'


export default class SpreadStrategy {
  static fixed(depth, quantity, step) { return new FixedSpread(depth, quantity, step) }

  generateOrdersFor(price, currencies) { throw new TypeError('Must override method') }
}


class FixedSpread extends SpreadStrategy {
  constructor(depth, quantity, step) {
    super()
    this._depth = depth
    this._quantity = quantity
    this._step = step
  }

  get depth() { return this._depth }
  get quantity() { return this._quantity }
  get step() { return this._step }

  generateOrdersFor(price, currencies) {
    return Range(1, this.depth + 1).flatMap(i =>
      List.of(
        Order.ask(this.quantity, price + (i * this.step), currencies),
        Order.bid(this.quantity, price - (i * this.step), currencies)
      )
    ).toList()
  }
}



