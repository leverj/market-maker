import {Side} from "./orders"
import {Currency} from "./currencies"
import {Exchange} from "./exchange"


class StubbedExchange extends Exchange {
  constructor() {
    super()
    this._exchangeRate = 0
  }

  get exchangeRate() { return this._exchangeRate }
  set exchangeRate(value) { this._exchangeRate = value }

  place(order) { throw new TypeError("Must override method") }
  update(order) { throw new TypeError("Must override method") }
  cancel(order) { throw new TypeError("Must override method") }
  currentExchangeRateFor(currencies) { throw new TypeError("Must override method") }
}


describe('Exchange', () => {
  const currencies = Currency.pair(Currency.LEV(), Currency.ETH())
  const exchange = new StubbedExchange()

  describe('getting current exchange rate', () => {
    it('should be able to artificially set it up', () => {
      expect(exchange.exchangeRate).toBe(0)

      exchange.exchangeRate = 1.25
      expect(exchange.exchangeRate).toBe(1.25)
    })
  })

})