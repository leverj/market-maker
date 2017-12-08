import uuidv4 from 'uuid/v4'
import {List, Map} from 'immutable'
import ExchangeGateway, {TradeSubscriber} from '../../gateways/ExchangeGateway'
import OrderBook from '../../domain/OrderBook'
import CurrencyPair from "../../domain/CurrencyPair"


export default class StubbedGateway extends ExchangeGateway {
  constructor(exchangeRate = 0, currencies = CurrencyPair.of('LEV', 'ETH')) {
    super('Playground')
    this.book = OrderBook.of(currencies)
    this.exchangeRate = exchangeRate
    this.balances = Map(List.of([currencies.primary.symbol, 0],[currencies.secondary.symbol, 0]))
    this.subscriber = null /* subscriber is populated on subscribe(...) call */
  }

  setBook(value) { this.book = value }
  setExchangeRate(value) { this.exchangeRate = value }

  listenTo(trade) { this.subscriber.listenTo(trade) }

  async getCurrentOrdersFor(currencies) { return Promise.resolve(this.book.orders) }

  async getOrder(id) { return Promise.resolve(this.book.getOrder(id)) }

  async getLastExchangeRateFor(currencies) { return Promise.resolve(this.exchangeRate) }

  async getBalancesFor(currencies) { return Promise.resolve(this.balances) }

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
    this.subscriber = new StubbedSubscriber(`${this.name} subscriber`, channels, callback)
  }
}


class StubbedSubscriber extends TradeSubscriber {
  constructor(name, channels, callback) {
    super(name, channels, callback)
  }

  listenTo(trade) { this.callback(trade) }
}
