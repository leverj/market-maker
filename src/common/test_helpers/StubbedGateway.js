import uuidv4 from 'uuid/v4'
import * as fixtures from './fixtures'
import ExchangeGateway, {TradeSubscriber} from '../../gateways/ExchangeGateway'
import OrderBook from '../../domain/OrderBook'


export default class StubbedGateway extends ExchangeGateway {
  constructor(exchangeRate = 0, currencies = fixtures.currencies) {
    super('Playground')
    this.book = OrderBook.of(currencies)
    this.exchangeRate = exchangeRate
    this.substriber = null /* subscriber is populated on subscribe(...) call */
  }

  setBook(value) { this.book = value }

  setExchangeRate(value) { this.exchangeRate = value }

  subscribe(currencies, callback) {
    const channels = [`trade.${currencies.code}`]
    this.substriber = new StubbedSubscriber(`${this.name} subscriber` , channels, callback)
  }
  notifyOfTrade(trade) { this.substriber.callback(trade) }

  async getCurrentOrdersFor(currencies) { return Promise.resolve(this.book.orders) }

  async getLastExchangeRateFor(currencies) { return Promise.resolve(this.exchangeRate) }

  async place(order) { return Promise.resolve(this._place_(order)) }
  _place_(order) {
    const placed = order.placeWith(`id_${uuidv4()}`, new Date())
    this.book = this.book.mergeWith(placed)
    return placed.id
  }

  async cancel(order) {
    this.book = this.book.without(order)
    return Promise.resolve(true)
  }
}


class StubbedSubscriber extends TradeSubscriber {
  constructor(name, channels, callback) {
    super(name, channels, callback)
  }
}
