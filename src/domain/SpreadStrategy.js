import assert from 'assert'
import {List, Range} from 'immutable'
import Order from './Order'
import {decimalPlaces, toDecimalPlaces} from '../common/numbers'


export default class SpreadStrategy {
  static fromConfig(config) {
    switch (config.type) {
      case 'fixed': return SpreadStrategy.fixed(config.depth, config.quantity, config.step)
      default: throw new Error(`unrecognized spread strategy: ${config.type}`)
    }
  }

  static fixed(depth, quantity, step) {
    assert(depth >= 1, `${depth} : depth must be 1 or greater`)
    assert(quantity > 0, `${quantity} : quantity must be 1 or greater`)
    assert(step > 0, `${step} : step must be positive price increment`)
    return new FixedSpread(depth, quantity, step)
  }

  applyTo(price, currencies) { throw new TypeError('Must override method') }
}


class FixedSpread extends SpreadStrategy {
  constructor(depth, quantity, step) {
    super()
    this.depth = depth
    this.quantity = quantity
    this.step = step
  }

  applyTo(price, currencies) {
    const precision = decimalPlaces(price)
    return Range(1, this.depth + 1).flatMap(i =>
      List.of(
        Order.ask(this.quantity, toDecimalPlaces(price + (i * this.step), precision), currencies),
        Order.bid(this.quantity, toDecimalPlaces(price - (i * this.step), precision), currencies)
      )
    ).toList()
  }
}
