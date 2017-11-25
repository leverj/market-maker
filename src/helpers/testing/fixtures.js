import uuidv4 from 'uuid/v4'
import {List} from 'immutable'
import OrderBook from '../../domain/OrderBook'
import Currency from '../../domain/Currency'
import Exchange from '../../domain/Exchange'
import ExchangeGateway from '../../gateways/ExchangeGateway'
import {exceptionHandler} from './utils'


export const lev2eth = Currency.pair(Currency.LEV(), Currency.ETH())

export const newStubbedExchange = (gateway = StubbedGateway.of(lev2eth)) => new Exchange('Playground', gateway)


export class StubbedGateway extends ExchangeGateway {
  static of(currencies,  orders = List(), exchangeRate = 0) {
    const book = OrderBook.of(currencies, List())
    const gateway = new StubbedGateway(book, exchangeRate, exceptionHandler)
    orders.forEach(each => gateway._place(each))
    return gateway
  }

  constructor(book, exchangeRate, exceptionHandler) {
    super(exceptionHandler)
    this.book = book
    this.exchangeRate = exchangeRate
  }
  setExchangeRate(value) { this.exchangeRate = value }

  async getCurrentOrdersFor(currencies) { return Promise.resolve(this.book.orders) }

  async getLastExchangeRateFor(currencies) { return Promise.resolve(this.exchangeRate) }

  async place(order) { return Promise.resolve(this._place(order)) }
  _place(order) {
    const placed = order.placeWith(`id_${uuidv4()}`)
    this.book = this.book.usurp(placed)
    return placed.id
  }

  async cancel(order) {
    this.book = this.book.remove(order)
    return Promise.resolve(true)
  }
}
