import {exceptionHandler} from '../common/globals'


/**
 * gateway methods are external async calls
 */
 export default class ExchangeGateway {
  constructor(name) {
    this.name = name
    this.exceptionHandler = exceptionHandler
  }

  /** returns a List of pending orders */
  async getCurrentOrdersFor(currencies) { throw new TypeError('Must override method') }

  /** returns the last price traded */
  async getLastExchangeRateFor(currencies) { throw new TypeError('Must override method') }

  /** returns the id of the placed order */
  async place(order) { throw new TypeError('Must override method') }

  /** returns a success criteria  */
  async cancel(order) { throw new TypeError('Must override method') }

  /** subscribe to onTrade notification using a callback */
  registerOnTradeCallback(callback) { throw new TypeError('Must override method') }

  /** an opportunity to cleanup resources */
  shutdown() {  /* by default, do nothing */ }
}
