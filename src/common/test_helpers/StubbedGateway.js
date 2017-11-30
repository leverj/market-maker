import uuidv4 from 'uuid/v4'
import {exceptionHandler} from './utils'
import * as fixtures from './fixtures'
import ExchangeGateway from '../../gateways/ExchangeGateway'
import TradeSubscriber from '../../gateways/TradeSubscriber'
import OrderBook from "../../domain/OrderBook"


export default class StubbedGateway extends ExchangeGateway {
  constructor(currencies = fixtures.currencies) {
    super('Playground', exceptionHandler)
    this.book = OrderBook.of(currencies)
    this.exchangeRate = 0
    const channels = [`trade.${currencies.code}`]
    this.tradeSubstriber = new StubbedTradeSubscriber(this.name, channels, defaultCallback)
  }

  setBook(value) { this.book = value }

  setExchangeRate(value) { this.exchangeRate = value }

  setOnTradeCallback(callback) { this.tradeSubstriber.setOnTradeCallback(callback) }
  triggerCallbackWith(trade) { this.tradeSubstriber.triggerCallbackWith(trade) }

  async getCurrentOrdersFor(currencies) { return Promise.resolve(this.book.orders) }

  async getLastExchangeRateFor(currencies) { return Promise.resolve(this.exchangeRate) }

  async place(order) { return Promise.resolve(this._place_(order)) }
  _place_(order) {
    const placed = order.placeWith(`id_${uuidv4()}`)
    this.book = this.book.mergeWith(placed)
    return placed.id
  }

  async cancel(order) {
    this.book = this.book.without(order)
    return Promise.resolve(true)
  }
}

const defaultCallback = (trade) => console.log(`simulating triggering respondTo(trade) with ${trade}`)


export class StubbedTradeSubscriber extends TradeSubscriber {
  constructor(name, channels, callback) {
    super(name, channels, callback)
  }

  setOnTradeCallback(callback) { this.callback = callback }
  triggerCallbackWith(trade) { this.callback(trade) }

  subscribe() {  /* do nothing */ }
}
