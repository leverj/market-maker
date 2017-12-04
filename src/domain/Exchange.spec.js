import Exchange from './Exchange'
import CurrencyPair from "./CurrencyPair"
import StubbedGateway from "../common/test_helpers/StubbedGateway"


describe('Exchange', () => {
  const currencies = CurrencyPair.of('LEV', 'ETH')

  it('should get its name from its gateway', async () => {
    const exchange = new Exchange(new StubbedGateway(1.25, currencies))
    expect(await exchange.getLastExchangeRateFor(currencies)).toBe(1.25)
    expect(exchange.toString()).toEqual('Playground Exchange')
  })

  it('should be able to get the latest exchange rate', async () => {
    const exchange = new Exchange(new StubbedGateway())
    expect(await exchange.getLastExchangeRateFor(currencies)).toBe(0)

    exchange.gateway.setExchangeRate(1.25)
    expect(await exchange.getLastExchangeRateFor(currencies)).toBe(1.25)
  })

})