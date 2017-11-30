import * as fixtures from './fixtures'
import StubbedGateway from './StubbedGateway'


describe('simulating subscribe triggering onTrade callback', () => {
  beforeEach( () => tradingResult = 'never called' )

  describe('StubbedGateway', () => {
    it('should be able to set & trigger a callback', async () => {
      const gateway = new StubbedGateway()
      gateway.subscribe(fixtures.currencies, onTrade)
      expect(tradingResult).toEqual('never called')

      gateway.notifyOfTrade('whatever')
      expect(tradingResult).toEqual('doing the right thing with: whatever')
    })

  })
})

function onTrade(value) { tradingResult = `doing the right thing with: ${value}` }
let tradingResult = undefined
