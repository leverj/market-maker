import Exchange from './Exchange'
import * as fixtures from '../helpers/test_fixtures'


describe('Exchange', () => {
  const currencies = fixtures.defaultCurrencyPair
  const exchange = fixtures.newExchange()

  it('should be able to get the latests exchange rate', async () => {
    expect(await exchange.getLastExchangeRateFor(currencies)).toBe(0)

    exchange.gateway.exchangeRate = 1.25
    expect(await exchange.getLastExchangeRateFor(currencies)).toBe(1.25)
  })

})