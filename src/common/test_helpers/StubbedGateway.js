import uuidv4 from 'uuid/v4'
import ExchangeGateway, {TradeSubscriber} from '../../gateways/ExchangeGateway'
import OrderBook from '../../domain/OrderBook'
import CurrencyPair from "../../domain/CurrencyPair"


export default class StubbedGateway extends ExchangeGateway {
  constructor(exchangeRate = 0, currencies = CurrencyPair.of('LEV', 'ETH')) {
    super('Playground')
    this.book = OrderBook.of(currencies)
    this.exchangeRate = exchangeRate
    this.substriber = null /* subscriber is populated on subscribe(...) call */
  }

  setBook(value) { this.book = value }
  setExchangeRate(value) { this.exchangeRate = value }

  listenTo(trade) { this.substriber.listenTo(trade) }

  async getCurrentOrdersFor(currencies) { return Promise.resolve(this.book.orders) }

  async getLastExchangeRateFor(currencies) { return Promise.resolve(this.exchangeRate) }

  async place(order) {
    return Promise.resolve(() => {
      const placed = order.placeWith(`id_${uuidv4()}`, new Date())
      this.book = this.book.mergeWith(placed)
      return placed.id
    })
  }

  async cancel(order) {
    this.book = this.book.without(order)
    return Promise.resolve(true)
  }

  subscribe(currencies, callback) {
    const channels = [`order.${currencies.code}`]
    this.substriber = new StubbedSubscriber(`${this.name} subscriber`, channels, callback)
  }
}


class StubbedSubscriber extends TradeSubscriber {
  constructor(name, channels, callback) {
    super(name, channels, callback)
  }

  listenTo(trade) { this.callback(trade) }
}
