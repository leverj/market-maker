import {makeMarketMakers} from './initial'


describe('initial setup', () => {
  it('creates markets from configuration', () => {
    const marketMakers = makeMarketMakers()
    expect(marketMakers.size).toBe(1)

    const marketMaker = marketMakers.first()
    expect(marketMaker.book.orders.size).toBe(0)
    expect(marketMaker.strategy.depth).toBe(3)
    expect(marketMaker.currencies.code).toBe('LEVETH')
    expect(marketMaker.saveChanges).toBe(true)
  })
})
