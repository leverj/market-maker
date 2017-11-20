import Gatecoin from './Gatecoin'


describe('gateway api', () => {
  const apiKey = 'get real'
  const currencyPair = 'BTCUSD'
  // const site = 'https://api.gatecoin.com'
  const site = 'https://api.gtcprojects.com'
  const gateway = new Gatecoin(site, apiKey)

  it.skip('should get live ticker', async () => {
    const response = await gateway.getLastExchangeRateFor(currencyPair)
    console.log('***************************************************************')
    console.log(await response)
    console.log('***************************************************************')
  })

})