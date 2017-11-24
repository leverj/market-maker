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

  offset(tradedOrder) {
    assert(this.hasOrder(tradedOrder.id), `can only offset an existing order: ${tradedOrder}`)
    const existingOrder = this.getOrder(tradedOrder.id)
    assert(existingOrder.isRelatedTo(tradedOrder), `can only offset a related order \n\t${existingOrder}\n\t${tradedOrder}`)
    return tradedOrder.isFulfilled ?
      this.remove(tradedOrder) :
      this.usurp(tradedOrder)
  }

  remove(order) { return new OrderBook(this.map.deleteIn(['orders', order.id])) }
  usurp(order) { return new OrderBook(this.map.setIn(['orders', order.id], order.map)) }
}

