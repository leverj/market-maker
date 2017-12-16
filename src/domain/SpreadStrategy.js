import assert from 'assert'
import {List, Range} from 'immutable'
import Order from './Order'
import {decimalPlaces, toDecimalPlaces, log10} from '../common/numbers'


export default class SpreadStrategy {
  static fromConfig(config) {
    switch (config.type) {
      case 'fixed': return this.fixed(config.depth, config.quantity, config.step)
      case 'linear': return this.linear(config.depth, config.quantity, config.step, config.factor)
      case 'ratio': return this.ratio(config.depth, config.quantity, config.ratio)
      case 'logarithmic': return this.logarithmic(config.depth, config.quantity, config.factor)
      default: throw new Error(`unrecognized spread strategy: ${config.type}`)
    }
  }

  static fixed(depth, quantity, step) { return this.linear(depth, quantity, step, 0) }
  static linear(depth, quantity, step, factor) { return new LinearSpread(depth, quantity, step, factor) }
  static ratio(depth, quantity, ratio) { return new RatioSpread(depth, quantity, ratio) }
  static logarithmic(depth, quantity, factor) { return new LogarithmicSpread(depth, quantity, factor) }

  constructor(depth, quantity) {
    assert(depth >= 1, `${depth} : depth must be 1 or greater`)
    assert(quantity > 0, `${quantity} : quantity must be 1 or greater`)
    this.depth = depth
    this.quantity = quantity
  }

  applyTo(price, currencies) {
    const pricePrecision = decimalPlaces(price)
    return Range(1, this.depth + 1).flatMap(i => {
      const priceDelta = this.priceDelta(i, price)
      const quantityDelta = this.quantityDelta(i)
      const quantity = this.quantity + quantityDelta
      return List.of(
        Order.ask(quantity, toDecimalPlaces(price + priceDelta, pricePrecision), currencies),
        Order.bid(quantity, toDecimalPlaces(price - priceDelta, pricePrecision), currencies)
      )}
    ).toList()
  }

  priceDelta(i, price) { throw new TypeError('Must override method') }
  quantityDelta(i) { throw new TypeError('Must override method') }
}


class LinearSpread extends SpreadStrategy {
  constructor(depth, quantity, step, factor) {
    super(depth, quantity)
    assert(step > 0, `${step} : step must be a positive price increment`)
    this.step = step
    this.factor = factor
  }
  priceDelta(i, price) { return i * this.step }
  quantityDelta(i) { return  Math.round((i-1) * this.quantity * this.factor) }
}

class RatioSpread extends SpreadStrategy {
  constructor(depth, quantity, ratio) {
    super(depth, quantity)
    this.ratio = ratio
  }
  priceDelta(i, price) { return i * price * this.ratio }
  quantityDelta(i) { return Math.round((i-1) * this.quantity * this.ratio) }
}

class LogarithmicSpread extends SpreadStrategy {
  constructor(depth, quantity, factor) {
    super(depth, quantity)
    this.factor = factor
  }
  priceDelta(i, price) { return log10(i * price * this.factor) }
  quantityDelta(i) { return Math.round((i-1) * log10(this.quantity * this.factor)) }
}
