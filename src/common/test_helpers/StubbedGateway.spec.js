import StubbedGateway from './StubbedGateway'
import CurrencyPair from "../../domain/CurrencyPair"


describe('simulating subscribe triggering registered callback', () => {
  beforeEach( () => respondToResult = 'never called' )

  describe('StubbedGateway', () => {
    it('should be able to set & trigger a callback', async () => {
      const gateway = new StubbedGateway()
      gateway.subscribe(CurrencyPair.of('LEV', 'ETH'), respondTo)
      expect(respondToResult).toEqual('never called')

      gateway.listenTo('whatever')
      expect(respondToResult).toEqual('doing the right thing with: whatever')
    })

  })
})

const respondTo = (value) => respondToResult = `doing the right thing with: ${value}`
let respondToResult = undefined
