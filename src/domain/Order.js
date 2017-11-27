import assert from 'assert'
import {Map} from 'immutable'
import ImmutableObject from '../common/ImmutableObject'


/** I start as an intention to trade on an newExchange a quantity of a primary currency in terms of a secondary currency.
 * once I'm placed to be traded in an newExchange I become part of an order book, until I am fulfilled (either sold or bought in full)
 */
export default class Order extends ImmutableObject {
  static of(side, quantity, price, currencies) {
    assert(quantity > 0, `${quantity} : quantity must be positive`)
    assert(price > 0, `${price} : price must be positive`)
    return new Order(Map({
      id: undefined,
      timestamp: undefined,
      currencies: currencies.map,
      side: side,
      price: price,
      quantity: quantity,
      remaining: quantity,
    }))
  }
  static ask(quantity, price, currencies) { return this.of(Side.ask, quantity, price, currencies) }
  static bid(quantity, price, currencies) { return this.of(Side.bid, quantity, price, currencies) }

  constructor(map) { super(map) }
  get id() { return this.map.get('id') }
  get timestamp() { return this.map.get('timestamp') }
  get currencies() { return this.map.get('currencies') }
  get side() { return this.map.get('side') }
  get price() { return this.map.get('price')}
  get quantity() { return this.map.get('quantity') }
  get remaining() { return this.map.get('remaining') }

  get currenciesCode() { return this.map.getIn(['currencies', 'code']) }
  get isBid() { return this.side == Side.bid}
  get isAsk() { return this.side == Side.ask }

  get isPlaced() { return !!(this.id) }
  get isNew() { return this.quantity == this.remaining }
  get isFulfilled() { return this.remaining == 0 }
  get isPartial() { return !this.isNew && !this.isFulfilled }
  toString() { return `[${this.id}] ${this.side} ${this.quantity} ${this.currencies.primary} @ ${this.price} ${this.currencies.secondary}` }

  placeWith(id, timestamp = new Date /* UTC */) { return new Order(this.map.merge({id: id, timestamp: timestamp})) }

  _less_(quantity) {
    assert(quantity <= this.remaining, `only ${this.remaining} remaining; ${this.remaining} is too large`)
    return new Order(this.map.merge({remaining: this.remaining - quantity}))
  }

  isRelatedTo(that) {
    return (
      this.id == that.id &&
      this.side == that.side &&
      this.price == that.price &&
      this.currencies.equals(that.currencies)
    )
  }

}

export const Side = {ask: 'Ask', bid: 'Bid'}
