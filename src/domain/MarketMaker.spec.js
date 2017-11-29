import {List} from 'immutable'
import * as fixtures from '../common/test_helpers/fixtures'
import StubbedGateway from '../common/test_helpers/StubbedGateway'
import makeStore from '../state_machine/store'
import Order from './Order'
import SpreadStrategy from './SpreadStrategy'
import MarketMaker from './MarketMaker'


describe('MarketMaker', () => {
  const depth = 3, quantity = 1, step = 0.1
  const spread = SpreadStrategy.fixed(depth, quantity, step)

  const price = 110.0, currencies = fixtures.currencies
  const orders = List.of(
    Order.ask(20, price + 5, currencies),
    Order.ask(10, price + 1, currencies),
    Order.bid(10, price - 1, currencies),
  )

  describe('on creation, retrieve pending orders in exchange', () => {
    it('if the exchange has orders, marketMaker should be able to synchronize with them', async () => {
      const gateway = new StubbedGateway(orders)
      const exchange = fixtures.newExchange(gateway)
      const marketMaker = MarketMaker.of(makeStore(), exchange, spread, currencies)
      const book = await marketMaker.synchronize()
      expect(book).toEqual(exchange.gateway.book)
      expect(book.size).toBe(orders.size)
      expect(book.asks.size).toBe(2)
      expect(book.bids.size).toBe(1)
    })

    //fixme: write the tests for synchronize and respondTo
    // it('if starting with an empty book, recalibrate', () => {
    //   MarketMaker.of(fixtures.newExchange(), spread, book)
    //   expect(book.size).toBeGreaterThen(0)
    // })
/*
      console.log("****************************************")
      console.log(maker.book.toJS())
      console.log("****************************************")
 */
  })

})
