import {List} from 'immutable'
import {StubbedGateway, lev2eth, newStubbedExchange} from '../helpers/test_fixtures'
import Order from './Order'
import OrderBook from './OrderBook'
import SpreadStrategy from './SpreadStrategy'
import MarketMaker from './MarketMaker'


describe('MarketMaker', () => {
  const depth = 3, quantity = 1, step = 0.1, strategy = SpreadStrategy.fixed(depth, quantity, step)
  const currencies = lev2eth

  describe('on creation, retrieve pending orders in exchange', () => {
    it('if exchange has none, internal book should be empty', async () => {
      const exchange = newStubbedExchange(StubbedGateway.from(currencies, List()))
      const maker = await MarketMaker.from(exchange, strategy, currencies)
      expect(maker.book).toEqual(exchange.gateway.book)
      expect(maker.book.size).toBe(0)
    })

    it('if exchange has orders, internal book should have them too', async () => {
      const quantity = 10, price = 110.0
      const orders = List.of(
        Order.ask(quantity, price + 5, currencies),
        Order.ask(quantity, price + 1, currencies),
        Order.bid(quantity, price - 1, currencies),
      )
      const exchange = newStubbedExchange(StubbedGateway.from(currencies, orders))
      const maker = await MarketMaker.from(exchange, strategy, currencies)
      expect(maker.book).toEqual(exchange.gateway.book)
      expect(maker.book.size).toBe(orders.size)
      expect(maker.book.asks.size).toBe(2)
      expect(maker.book.bids.size).toBe(1)
    })

    // it('if starting with an empty book, recalibrate', () => {
    //   const emptyBook = OrderBook.from(currencies, List())
    //   MarketMaker.from(fixturesnewStubbedExchange(), strategy, emptyBook)
    //   expect(book.size).toBeGreaterThen(0)
    // })
/*
      console.log("****************************************")
      console.log(maker.book.toJS())
      console.log("****************************************")
 */
  })

})
