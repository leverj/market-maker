import {List, Range} from 'immutable'
import Order from './Order'


export default class SpreadStrategy {
  static fixed(depth, quantity, step) { return new FixedSpread(depth, quantity, step) }

  generateOrdersFor(price, currencies) { throw new TypeError('Must override method') }
}


class FixedSpread extends SpreadStrategy {
  constructor(depth, quantity, step) {
    super()
    this.depth = depth
    this.quantity = quantity
    this.step = step
  }

  generateOrdersFor(price, currencies) {
    return Range(1, this.depth + 1).flatMap(i =>
      List.of(
        Order.ask(this.quantity, price + (i * this.step), currencies),
        Order.bid(this.quantity, price - (i * this.step), currencies)
      )
    ).toList()
  }
}



