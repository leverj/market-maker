import Gatecoin from './Gatecoin'
import {config} from '../config'


describe.skip('gateway api', () => {
  const gateway = new Gatecoin(config.Gatecoin.site, config.Gatecoin.apiKey)

  it('should get live ticker', async () => {
    const response = await gateway.getLastExchangeRateFor(config.Gatecoin.currencyPair)
    console.log('***************************************************************')
    console.log(await response)
    console.log('***************************************************************')
  })

})