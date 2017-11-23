import assert from 'assert'
import {Map} from 'immutable'
import ImmutableObject from './ImmutableObject'


/** I start as an intention to trade on an exchange an amount of a primary currency in terms of a secondary currency.
 * once I'm placed to be traded in an exchange I become part of an order book, until I am fulfilled (either sold or bought in full)
 */
export default class Order extends ImmutableObject {
  static from(way, amount, price, currencies, id='') {
    assert(amount >= 0, `${amount} : amount must be non-negative`)
    assert(price > 0, `${price} : price must be positive`)
    return new Order(Map({
      id: id,
      way: way,
      amount: amount,
      price: price,
      currencies: currencies.map,
    }))
  }
  static ask(amount, price, currencies, id='') { return Order.from(Way.ask, amount, price, currencies, id) }
  static bid(amount, price, currencies, id='') { return Order.from(Way.bid, amount, price, currencies, id) }

  constructor(map) { super(map) }
  get id() { return this.map.get('id') }
  get way() { return this.map.get('way') }
  get amount() { return this.map.get('amount') }
  get price() { return this.map.get('price')}
  get currencies() { return this.map.get('currencies') }
  get currenciesCode() { return this.map.getIn(['currencies', 'code']) }
  get isBid() { return this.way == Way.bid}
  get isAsk() { return this.way == Way.ask }
  get isPlaced() { return !!this.id }
  toString() { return `[${this.id}] ${this.way} ${this.amount} ${this.currencies.primary} @ ${this.price} ${this.currencies.secondary}` }

  placeWithId(id) { return new Order(this.map.merge({id: id})) }

  isRelatedTo(that) {
    return (
      this.id == that.id &&
      this.way == that.way &&
      this.price == that.price &&
      this.currencies.equals(that.currencies)
    )
  }

  deduct(that) {
    assert(this.isRelatedTo(that), `to compute a difference, orders must have same id, way, price, and currencies \n\t${this}\n\t${that}`)
    return this.minus(that.amount)
  }
  minus(amount) {
    assert(this.amount >= amount, `deducted amount ${amount} cannot be greater then ${this.amount}`)
    return new Order(this.map.merge({amount: this.amount - amount}))
  }
  plus(amount) {
    return new Order(this.map.merge({amount: this.amount + amount}))
  }
}

export const Way = {ask: 'Ask', bid: 'Bid'}
