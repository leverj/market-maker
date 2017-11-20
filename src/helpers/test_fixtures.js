import Currency from '../domain/Currency'
import Exchange from '../domain/Exchange'


export const defaultCurrencyPair = Currency.pair(Currency.LEV(), Currency.ETH())
export function newExchange() { return new Exchange('test', new StubbedGateway()) }


class StubbedGateway {
  constructor() { this._exchangeRate = 0 }
  set exchangeRate(value) { this._exchangeRate = value }

  getLastExchangeRateFor(currencies) { return Promise.resolve(this._exchangeRate) }
  place(order) { throw new TypeError('Must override method') }
  cancel(order) { throw new TypeError('Must override method') }
}

