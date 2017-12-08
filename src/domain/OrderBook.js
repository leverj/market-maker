import assert from 'assert'
import {List, Map} from 'immutable'
import ImmutableObject from '../common/ImmutableObject'
import Order from './Order'
import CurrencyPair from './CurrencyPair'


/** I hold orders currently traded in an exchange.
 * my orders are placed or cancelled by a MarketMaker
 */
export default class OrderBook extends ImmutableObject {
  static of(currencies, orders = List()) {
    orders.forEach(each => assert(each.isPlaced, 'orders within a book must first be placed (have an id)'))
    return this.fromOrdersMap(currencies, ordersToMap(orders))
  }
  static fromOrdersMap(currencies, ordersMap) {
    return new OrderBook(Map({currencies: currencies.code, orders: ordersMap}))
  }

  constructor(map) { super(map) }
  get currencies() { return CurrencyPair.get(this.get('currencies')) }
  get orders() { return this.get('orders').toList().map(each => new Order(each)) }
  get bids() { return this.orders.filter(each => each.isBid) }
  get asks() { return this.orders.filter(each => each.isAsk) }
  get size() { return this.get('orders').size }
  toString() { return `${this.currencies.code} OrderBook [${this.size} orders]` }

  getOrder(id) { return this.hasOrder(id) ? new Order(this.getIn(['orders', id])) : null }
  hasOrder(id) { return this.hasIn(['orders', id]) }

  offset(order) {
    assert(this.hasOrder(order.id), `can only offset an existing order: ${order}`)
    const existingOrder = this.getOrder(order.id)
    assert(existingOrder.isRelatedTo(order), `can only offset a related order \n\t${existingOrder}\n\t${order}`)
    return order.isFulfilled ?
      this.without(existingOrder) :
      this.mergeWith(order)
  }

  without(order) { return new OrderBook(this.map.deleteIn(['orders', order.id])) }
  mergeWith(order) { return this.hasOrder(order.id) ?  this.modify(order) : this.add(order)}
  add(order) { return new OrderBook(this.map.setIn(['orders', order.id], order.map)) }
  modify(order) { return new OrderBook(this.map.setIn(['orders', order.id, 'remaining'], order.remaining)) }

  ordersApplicableTo(trade) {
    return List([this.getOrder(trade.ask), this.getOrder(trade.bid)]).filter(each => !!each)
  }
}


const ordersToMap = (orders) => Map(orders.map(each => [each.id, each.map]))

