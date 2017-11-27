import assert from 'assert'
import {List, Map} from 'immutable'
import ImmutableObject from '../common/ImmutableObject'
import Order from './Order'


/** I hold orders currently traded in an newExchange.
 * my orders are placed or cancelled by a MarketMaker
 */
export default class OrderBook extends ImmutableObject {
  static of(currencies, orders = List()) {
    orders.forEach(each => assert(each.isPlaced, 'orders within a book must first be placed (have an id)'))
    return this.fromOrdersMap(currencies, ordersToMap(orders))
  }
  static fromOrdersMap(currencies, ordersMap) {
    return new OrderBook(Map({currencies: currencies.map, orders: ordersMap}))
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
      this.without(existingOrder) :
      this.mergeWith(tradedOrder)
  }

  without(order) { return new OrderBook(this.map.deleteIn(['orders', order.id])) }
  mergeWith(order) { return new OrderBook(this.map.setIn(['orders', order.id], order.map)) }
}


export const ordersToMap = (orders) => Map(orders.map(each => [each.id, each.map]))

