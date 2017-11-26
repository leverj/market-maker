import uuidv4 from 'uuid/v4'
import {List} from 'immutable'
import ExchangeGateway from '../../gateways/ExchangeGateway'
import {exceptionHandler} from './utils'
import * as fixtures from './fixtures'


export default class StubbedGateway extends ExchangeGateway {
  constructor(orders = List()) {
    super('Playground', exceptionHandler)
    this.book = fixtures.emptyBook
    this.exchangeRate = 0
    orders.forEach(each => this.private_place(each))
  }
  setExchangeRate(value) { this.exchangeRate = value }

  async getCurrentOrdersFor(currencies) { return Promise.resolve(this.book.orders) }

  async getLastExchangeRateFor(currencies) { return Promise.resolve(this.exchangeRate) }

  async place(order) { return Promise.resolve(this.private_place(order)) }
  private_place(order) {
    const placed = order.placeWith(`id_${uuidv4()}`)
    this.book = this.book.mergeWith(placed)
    return placed.id
  }

  async cancel(order) {
    this.book = this.book.remove(order)
    return Promise.resolve(true)
  }
}
