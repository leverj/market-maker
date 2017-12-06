import {exceptionHandler} from '../common/globals'


/**
 * gateway to an external exchange
 * the gateway provides:
 * 1. (async) rest api for tickers and orders
 * 2. subscription to order's trading notifications
 */
 export default class ExchangeGateway {
  constructor(name) {
    this.name = name
    this.exceptionHandler = exceptionHandler
  }
  toString() { return `[${this.name} gateway]` }

  /** returns a List of pending orders */
  async getCurrentOrdersFor(currencies) { throw new TypeError('Must override method') }

  /** returns the last price traded */
  async getLastExchangeRateFor(currencies) { throw new TypeError('Must override method') }

  /** returns the id of the placed order */
  async place(order) { throw new TypeError('Must override method') }

  /** returns a success criteria  */
  async cancel(order) { throw new TypeError('Must override method') }

  /** subscribe to onTrade notification using a callback */
  subscribe(currencies, callback) { throw new TypeError('Must override method') }

  /** an opportunity to cleanup resources */
  shutdown() {  /* by default, do nothing */ }
}


export class TradeSubscriber {
  constructor(name, channels, callback) {
    this.name = name
    this.channels = channels
    this.callback = callback
    this.exceptionHandler = exceptionHandler
  }
  toString() { return `[${this.name}] : ${this.channels}` }

  /** an opportunity to cleanup resources */
  shutdown() {  /* by default, do nothing */ }
}

