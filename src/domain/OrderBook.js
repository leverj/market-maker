import assert from 'assert'
import {Map} from 'immutable'
import ImmutableObject from './ImmutableObject'
import Order from './Order'


export default class OrderBook extends ImmutableObject {
  static from(currencies, orders) {
    for(let each of orders.values()) { assert(each.isPlaced, `orders within a book must first be placed (have an id)`) }
    return new OrderBook(Map({
      currencies: currencies.map,
      orders: Map(orders.map(each => [each.id, each.map])),
    }))
  }

  constructor(map) { super(map) }
  get currencies() { return this.get('currencies') }
  get size() { return this.get('orders').size }
  toString() { return `[${this.currencies.primary}<->${this.currencies.secondary} OrderBook] : ${this.size}` }

  getOrder(id) { return new Order(this.getIn(['orders', id])) }
  hasOrder(id) { return this.hasIn(['orders', id]) }

  offset(order) {
    assert(order.isPlaced, `can offset only a placed order: ${order}`)
    assert(this.hasOrder(order.id), `can offset only an existing order: ${order}`)
    const id = order.id
    const offsetOrder = this.getOrder(id).deduct(order)
    return new OrderBook((offsetOrder.amount == 0) ?
      this.map.deleteIn(['orders', id]) :
      this.map.setIn(['orders', id], offsetOrder))
  }

  distanceFrom(orders) {
    return this.orders
  }
}

