import {lev2eth, newStubbedExchange} from '../helpers/test_fixtures'
import Exchange from './Exchange'


describe('Exchange', () => {
  const currencies = lev2eth
  const exchange = newStubbedExchange()

  it('should be able to get the latests exchange rate', async () => {
    expect(await exchange.getLastExchangeRateFor(currencies)).toBe(0)

    exchange.gateway.setExchangeRate(1.25)
    expect(await exchange.getLastExchangeRateFor(currencies)).toBe(1.25)
  })

})