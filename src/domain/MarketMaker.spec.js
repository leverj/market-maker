import {List} from 'immutable'
import * as fixtures from '../helpers/testing/fixtures'
import StubbedGateway from '../helpers/testing/StubbedGateway'
import Order from './Order'
import SpreadStrategy from './SpreadStrategy'
import MarketMaker from './MarketMaker'
import {sleep} from '../common/promises'


describe('MarketMaker', () => {
  const depth = 3, quantity = 1, step = 0.1
  const spread = SpreadStrategy.fixed(depth, quantity, step)

  const price = 110.0,currencies = fixtures.currencies
  const orders = List.of(
    Order.ask(20, price + 5, currencies),
    Order.ask(10, price + 1, currencies),
    Order.bid(10, price - 1, currencies),
  )

  describe('on creation, retrieve pending orders in exchange', () => {
    it('if exchange has none, internal book should be empty', () => {
      const exchange = fixtures.exchange(new StubbedGateway())
      const marketMaker = MarketMaker.of(exchange, spread, fixtures.emptyBook)
      expect(marketMaker.book).toEqual(exchange.gateway.book)
      expect(marketMaker.book.size).toBe(0)
    })

    it('if exchange has orders, internal book should have them too', async () => {
      const gateway = new StubbedGateway(orders)
      const exchange = fixtures.exchange(gateway)
      const marketMaker = await MarketMaker.of(exchange, spread, fixtures.emptyBook).synchronized()
      expect(marketMaker.book).toEqual(exchange.gateway.book)
      expect(marketMaker.book.size).toBe(orders.size)
      expect(marketMaker.book.asks.size).toBe(2)
      expect(marketMaker.book.bids.size).toBe(1)
    })

    // it('if starting with an empty book, recalibrate', () => {
    //   MarketMaker.of(fixtures.exchange(), spread, book)
    //   expect(book.size).toBeGreaterThen(0)
    // })
/*
      console.log("****************************************")
      console.log(maker.book.toJS())
      console.log("****************************************")
 */
  })

})
