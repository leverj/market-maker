import StubbedGateway, {StubbedTradeSubscriber} from './StubbedGateway'


describe('simulating subscribe triggering onTrade callback', () => {
  beforeEach( () => tradingResult = 'never called' )

  describe('StubbedGateway', () => {
    it('should be able to set & trigger a callback', async () => {
      const gateway = new StubbedGateway()
      gateway.setOnTradeCallback(onTrade)
      expect(tradingResult).toEqual('never called')

      gateway.triggerCallbackWith('whatever')
      expect(tradingResult).toEqual('doing the right thing with: whatever')
    })

  })

  describe('StubbedTradeSubscriber', () => {
    it('should be able to set & trigger a callback', async () => {
      const subscriber = new StubbedTradeSubscriber()
      subscriber.setOnTradeCallback(onTrade)
      expect(tradingResult).toEqual('never called')

      subscriber.triggerCallbackWith('whatever')
      expect(tradingResult).toEqual('doing the right thing with: whatever')
    })

  })
})

function onTrade(value) { tradingResult = `doing the right thing with: ${value}` }
let tradingResult = undefined
