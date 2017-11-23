import assert from 'assert'
import {List, Map} from 'immutable'
import ImmutableObject from './ImmutableObject'
import Order from './Order'


/** I hold orders currently traded in an exchange.
 * my orders are placed or cancelled by a MarketMaker
 */
export default class OrderBook extends ImmutableObject {
  static from(currencies, orders = List()) {
    orders.forEach(each => assert(each.isPlaced, `orders within a book must first be placed (have an id)`))
    return new OrderBook(Map({
      currencies: currencies.map,
      orders: Map(orders.map(each => [each.id, each.map])),
    }))
  }

  constructor(map) { super(map) }
  get currencies() { return this.get('currencies') }
  get orders() { return this.get('orders').toList().map(each => new Order(each)) }
  get bids() { return this.orders.filter(each => each.isBid) }
  get asks() { return this.orders.filter(each => each.isAsk) }
  get size() { return this.get('orders').size }
  toString() { return `[${this.currencies.code} OrderBook] : ${this.size}` }

  getOrder(id) { return new Order(this.getIn(['orders', id])) }
  hasOrder(id) { return this.hasIn(['orders', id]) }

  offset(order) {
    assert(order.isPlaced, `can only offset a placed order: ${order}`)
    assert(this.hasOrder(order.id), `can only offset an existing order: ${order}`)
    const offsetOrder = this.getOrder(order.id).deduct(order)
    return offsetOrder.amount == 0 ? this._delete(offsetOrder) : this._update(offsetOrder)
  }

  _delete(order) { return new OrderBook(this.map.deleteIn(['orders', order.id])) }
  _update(order) { return new OrderBook(this.map.setIn(['orders', order.id], order.map)) }
  _add(order) { return this._update(order) }
}

