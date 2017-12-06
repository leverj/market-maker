import StubbedGateway from './StubbedGateway'
import CurrencyPair from "../../domain/CurrencyPair"


describe('simulating subscribe triggering registered callback', () => {
  beforeEach( () => callbackResult = 'never called' )

  describe('StubbedGateway', () => {
    it('be able to set & trigger a callback', async () => {
      const gateway = new StubbedGateway()
      gateway.subscribe(CurrencyPair.of('LEV', 'ETH'), callback)
      expect(callbackResult).toEqual('never called')

      gateway.listenTo('whatever')
      expect(callbackResult).toEqual('doing the right thing with: whatever')
    })

  })
})

const callback = (value) => callbackResult = `doing the right thing with: ${value}`
let callbackResult = undefined
