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
    return this.linear(depth, quantity, step, 0)
  }

  static linear(depth, quantity, step) {
    assert(depth >= 1, `${depth} : depth must be 1 or greater`)
    assert(quantity > 0, `${quantity} : quantity must be 1 or greater`)
    assert(step > 0, `${step} : step must be positive price increment`)
    return new LinearSpread(depth, quantity, step, 0)
  }

  applyTo(price, currencies) { throw new TypeError('Must override method') }
}


class LinearSpread extends SpreadStrategy {
  constructor(depth, quantity, step, slope) {
    super()
    this.depth = depth
    this.quantity = quantity
    this.step = step
    this.slope = slope
  }

  applyTo(price, currencies) {
    assert(price - (this.depth * this.step) > 0, `${price} : price is too low`)
    const pricePrecision = decimalPlaces(price)
    return Range(1, this.depth + 1).flatMap(i => {
      const quantity = this.quantity + (i * this.slope)
      const priceDelta = i * (this.step + this.slope)
      return List.of(
        Order.ask(quantity, toDecimalPlaces(price + priceDelta, pricePrecision), currencies),
        Order.bid(quantity, toDecimalPlaces(price - priceDelta, pricePrecision), currencies)
      )}
    ).toList()
  }
}
