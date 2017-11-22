import assert from 'assert'
import {List} from 'immutable'
import {Way} from './Order'


export default class OrderBook {
  constructor(currencies, orders) {
    for(let each of orders.values()) { assert(each.isPlaced, `orders within a book must first be placed (have an id)`) }
    this._currencies = currencies
    this._orders = orders
  }

  get currencies() { return this._currencies }
  get orders() { return List(this._orders.values()) }
  get bids() { return this.orders.filter(each => each.way == Way.bid) }
  get asks() { return this.orders.filter(each => each.way == Way.ask) }
  get size() { return this.orders.size }
  get(orderId) { return this._orders.get(orderId) }
  has(orderId) { return this._orders.has(orderId) }

  toString() { return `[${this.currencies} OrderBook] : ${this._orders.size}` }

  offset(order) {
    assert(order.isPlaced, `can offset only a placed order: ${order}`)
    assert(this.has(order.id), `can offset only an existing order: ${order}`)
    const id = order.id
    const offsetOrder = this.get(id).deduct(order)
    const modifiedOrders = (offsetOrder.amount == 0) ? this._orders.remove(id) : this._orders.set(id, offsetOrder)
    return new OrderBook(this.currencies, modifiedOrders)
  }

  distanceFrom(orders) {
    return this.orders
  }
}

