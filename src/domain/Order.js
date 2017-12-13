import assert from 'assert'
import {Map} from 'immutable'
import ImmutableObject from '../common/ImmutableObject'
import CurrencyPair from './CurrencyPair'


/** I start as an intention to trade on an exchange a quantity of a primary currency in terms of a secondary currency.
 * once I'm placed to be traded in an exchange I become part of an order book, until I am fulfilled (either sold or bought in full)
 */
export default class Order extends ImmutableObject {
  static of(side, quantity, price, currencies) {
    assert(quantity > 0, `${quantity} : quantity must be positive`)
    assert(price > 0, `${price} : price must be positive`)
    return new Order(Map({
      id: undefined,
      timestamp: undefined,
      currencies: currencies.code,
      side: side,
      price: price,
      quantity: quantity,
      remaining: quantity,
    }))
  }
  static ask(quantity, price, currencies) { return this.of(Side.ask, quantity, price, currencies) }
  static bid(quantity, price, currencies) { return this.of(Side.bid, quantity, price, currencies) }

  static toComparable(order) { return new ComparableOrder(order.map) }

  constructor(map) { super(map) }
  get id() { return this.map.get('id') }
  get timestamp() { return this.map.get('timestamp') }
  get currencies() { return CurrencyPair.get(this.get('currencies')) }
  get side() { return this.map.get('side') }
  get price() { return this.map.get('price')}
  get quantity() { return this.map.get('quantity') }
  get remaining() { return this.map.get('remaining') }
  toString() {
    const primary = this.currencies.primary.symbol
    const secondary = this.currencies.secondary.symbol
    return `${this.side} ${this.quantity} ${primary} @ ${this.price} ${secondary} (${this.remaining} remaining)`
  }
  toLongString() { return `${this.toString()} [${this.id} : ${this.timestamp}]` }

  get isBid() { return this.side == Side.bid}
  get isAsk() { return this.side == Side.ask }
  get isPlaced() { return !!(this.id) }
  get isNew() { return this.quantity == this.remaining }
  get isExecuted() { return this.remaining == 0 }
  get isPartial() { return !this.isNew && !this.isExecuted }
  isRelatedTo(that) { return this.isLike(that) && this.id == that.id }
  isLike(that) {
    return (
      this.side == that.side &&
      this.price == that.price &&
      this.quantity == that.quantity &&
      this.currencies.equals(that.currencies)
    )
  }

  placeWith(id, timestamp = new Date /* UTC */) { return new Order(this.map.merge({id: id, timestamp: timestamp})) }

  withRemaining(remaining) {
    assert(remaining < this.quantity, `remaining=${remaining} must be less then quantity=${this.quantity}`)
    return new Order(this.map.merge({remaining: remaining}))
  }

  less(quantity) {
    assert(quantity <= this.remaining, `only ${this.remaining} remaining; ${this.remaining} is too large`)
    return this.withRemaining(this.remaining - quantity)
  }
}

export const Side = {ask: 'Ask', bid: 'Bid'}


class ComparableOrder extends Order {
  constructor(map) { super(map) }

  /** overriding (ValueObject) equality to compare using similarity */
  hashCode() { return this.side.length * this.price * this.quantity * this.remaining * this.currencies.hashCode() }
  equals(that) { return this.isSimilarTo(that) }
  isSimilarTo(that) { return this.isLike(that) && this.remaining == that.remaining }
}