import assert from 'assert'
import {Way} from './Order'


export class OrderBook {
  constructor(currencies, orders) {
    const invalid = orders.filter(each => !each.isPlaced)
    assert(invalid.isEmpty(), `orders within a book must first be placed (have an id). these do not: ${invalid}`)
    assert(orders.keys().toSet().size() == orders.keys().size(), `orders ids must be unique within a book: ${orders.keys()}`)
    this._currencies = currencies
    this._orders = orders
  }

  get currencies() { return this._currencies }
  get orders() { return this._orders.values() }
  get bids() { return this.orders.filter(each => each.way == Way.bid) }
  get asks() { return this.orders.filter(each => each.way == Way.ask) }

  toString() { return `[${this.currencies} OrderBook] : ${this._orders.size}` }

  offset(order) {
    assert(order.isPlaced, `can offset only a placed order: ${order}`)
    const id = order.id
    const offsetOrder = this._orders.get(id).deduct(order)
    const modifiedOrders = (offsetOrder.amount == 0) ? this._orders.remove(id) : this._orders.set(id, offsetOrder)
    return new OrderBook(this.currencies, modifiedOrders)
  }

  distanceFrom(orders) {
    return this.orders
  }
}

