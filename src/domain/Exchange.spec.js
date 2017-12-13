import Exchange from './Exchange'
import CurrencyPair from "./CurrencyPair"
import StubbedGateway from "../gateways/StubbedGateway"


describe('Exchange', () => {
  const currencies = CurrencyPair.of('LEV', 'ETH')

  it('get name from gateway', async () => {
    const exchange = new Exchange(new StubbedGateway(1.25, currencies))
    expect(await exchange.getLastExchangeRateFor(currencies)).toBe(1.25)
    expect(exchange.toString()).toEqual('Playground Exchange')
  })

  it('get the latest exchange rate', async () => {
    const exchange = new Exchange(new StubbedGateway())
    expect(await exchange.getLastExchangeRateFor(currencies)).toBe(0)

    exchange.gateway.setExchangeRate(1.25)
    expect(await exchange.getLastExchangeRateFor(currencies)).toBe(1.25)
  })

})