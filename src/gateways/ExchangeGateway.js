
/**
 * gateway methods are external async calls
 */
 export default class ExchangeGateway {
  getLastExchangeRateFor(currencies) { throw new TypeError('Must override method') }
  place(order) { throw new TypeError('Must override method') }
  cancel(order) { throw new TypeError('Must override method') }
}
