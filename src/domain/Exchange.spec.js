import * as fixtures from '../common/test_helpers/fixtures'
import Exchange from './Exchange'


describe('Exchange', () => {
  const currencies = fixtures.currencies

  it('should get its name from its gateway', async () => {
    const exchange = fixtures.newExchange()
    exchange.gateway.setExchangeRate(1.25)
    expect(exchange.toString()).toEqual('Playground Exchange')
  })

  it('should be able to get the latest exchange rate', async () => {
    const exchange = fixtures.newExchange()
    expect(await exchange.getLastExchangeRateFor(currencies)).toBe(0)

    exchange.gateway.setExchangeRate(1.25)
    expect(await exchange.getLastExchangeRateFor(currencies)).toBe(1.25)
  })

})