import * as matchers from 'jest-immutable-matchers'
import {currencies, emptyBook, newExchange} from '../common/test_helpers/fixtures'
import SpreadStrategy from './SpreadStrategy'
import MarketMaker, {groupByCancelKeepPlace} from './MarketMaker'
import OrderBook from './OrderBook'
import Order from './Order'


describe('MarketMaker', () => {
  const depth = 3, quantity = 2, step = 0.1
  const spread = SpreadStrategy.fixed(depth, quantity, step)
  const price = 10.50
  const orders = spread.generateOrdersFor(price, currencies).map((each, index) => each.placeWith(`id_${index}`))
  const fullBook = OrderBook.of(currencies, orders)

  async function synchronizedMarketMaker(book) {
    const maker = makeMarketMaker(book)
    await maker.synchronize()
    return maker
  }

  function makeMarketMaker(book) {
    const maker = MarketMaker.of(newExchange(), spread, currencies)
    maker.exchange.gateway.setBook(book)
    maker.exchange.gateway.setExchangeRate(price)
    return maker
  }

  describe("synchronize: after creation, synchronize with exchange's pending orders", () => {
    beforeEach( () => jest.addMatchers(matchers) )

    it('if the exchange has pending orders, retrieve them', async () => {
      const marketMaker = makeMarketMaker(fullBook)
      expect(marketMaker.book.orders.size).toBe(0)

      await marketMaker.synchronize()
      expect(marketMaker.book).toEqualImmutable(fullBook)
    })

    it('if the exchange has no orders, re-spread with new orders', async () => {
      const marketMaker = makeMarketMaker(emptyBook)
      expect(marketMaker.book.orders.size).toBe(0)

      await marketMaker.synchronize()
      expect(marketMaker.book.orders.size).toBe(fullBook.size)
      //fixme: compare with immutables
      // expect(marketMaker.book).toEqualImmutable(fullBook)
    })
  })

  describe('respondTo(trade)', () => {
    it('respondTo(unrelated trade) => nothing changes', async () => {
      const marketMaker = await synchronizedMarketMaker(fullBook)
      const order = marketMaker.book.bids.first()
      const notInTheBookTrade = order._less_(1).placeWith('not-in-the-book-id')
      expect(order.remaining).toBe(2)
      expect(notInTheBookTrade.remaining).toBe(1)

      expect(marketMaker.book.orders.size).toBe(fullBook.size)
      expect(marketMaker.book.getOrder(order.id).remaining).toBe(2)

      await marketMaker.respondTo(notInTheBookTrade)
      expect(marketMaker.book.orders.size).toBe(fullBook.size)
      expect(marketMaker.book.getOrder(order.id).remaining).toBe(2)

      // order with all  the same but the side
      const unrelatedTrade = Order.ask(order.quantity, order.price, order.currencies).placeWith(order.id, order.timestamp)
      await marketMaker.respondTo(unrelatedTrade)
      expect(marketMaker.book.orders.size).toBe(fullBook.size)
      expect(marketMaker.book.getOrder(order.id).remaining).toBe(2)
    })

    it('respondTo(partial trade) => order is not fulfilled', async () => {
      const marketMaker = await synchronizedMarketMaker(fullBook)
      const order = marketMaker.book.bids.first()
      const trade = order._less_(1)
      expect(order.remaining).toBe(2)
      expect(trade.remaining).toBe(1)
      expect(trade.isPartial).toBe(true)

      expect(marketMaker.book.getOrder(order.id).remaining).toBe(2)

      await marketMaker.respondTo(trade)
      expect(marketMaker.book.getOrder(order.id).remaining).toBe(1)
    })

    it('respondTo(full trade) => order is fulfilled, and is off the book', async () => {
      const marketMaker = await synchronizedMarketMaker(fullBook)
      const order = marketMaker.book.bids.first()
      const trade = order._less_(order.quantity)
      expect(order.remaining).toBe(2)
      expect(trade.remaining).toBe(0)
      expect(trade.isFulfilled).toBe(true)

      expect(marketMaker.book.getOrder(order.id).remaining).toBe(2)

      await marketMaker.respondTo(trade)
      expect(marketMaker.book.hasOrder(order.id)).toBe(false)
    })
  })

  describe("groupByCancelKeepPlace(current, future)", () => {
    it('if current is empty and future is not, then 0 to cancel, 0 to keep, all to place', () => {
      const current = emptyBook.orders
      const shiftedPrice = price
      const future = spread.generateOrdersFor(shiftedPrice, currencies)
      expect(shiftedPrice).toBe(10.5)
      expect(current.map(v => v.price).sort().toArray()).toEqual([])
      expect(future.map(v => v.price).sort().toArray()).toEqual([10.2, 10.3, 10.4, 10.6, 10.7, 10.8])

      const {toCancel, toKeep, toPlace} = groupByCancelKeepPlace(current, future)
      expect(toCancel.map(v => v.price).sort().toArray()).toEqual([])
      expect(toKeep.map(v => v.price).sort().toArray()).toEqual([])
      expect(toPlace.map(v => v.price).sort().toArray()).toEqual([10.2, 10.3, 10.4, 10.6, 10.7, 10.8])
    })

    it('if current is full and future is equivalent, then 0 to cancel, all to keep, 0 to place', () => {
      const current = fullBook.orders
      const shiftedPrice = price
      const future = spread.generateOrdersFor(shiftedPrice, currencies)
      expect(shiftedPrice).toBe(10.5)
      expect(current.map(v => v.price).sort().toArray()).toEqual([10.2, 10.3, 10.4, 10.6, 10.7, 10.8])
      expect(future.map(v => v.price).sort().toArray()).toEqual([10.2, 10.3, 10.4, 10.6, 10.7, 10.8])

      const {toCancel, toKeep, toPlace} = groupByCancelKeepPlace(current, future)
      expect(toCancel.map(v => v.price).sort().toArray()).toEqual([])
      expect(toKeep.map(v => v.price).sort().toArray()).toEqual([10.2, 10.3, 10.4, 10.6, 10.7, 10.8])
      expect(toPlace.map(v => v.price).sort().toArray()).toEqual([])
    })

    it('if current is full and future is totally different, then all current to cancel, 0 to keep, all future to place', () => {
      const current = fullBook.orders
      const shiftedPrice = price + 100
      const future = spread.generateOrdersFor(shiftedPrice, currencies)
      expect(price).toBe(10.5)
      expect(shiftedPrice).toBe(110.5)
      expect(current.map(v => v.price).sort().toArray()).toEqual([10.2, 10.3, 10.4, 10.6, 10.7, 10.8])
      expect(future.map(v => v.price).sort().toArray()).toEqual([110.2, 110.3, 110.4, 110.6, 110.7, 110.8])

      const {toCancel, toKeep, toPlace} = groupByCancelKeepPlace(current, future)
      expect(toCancel.map(v => v.price).sort().toArray()).toEqual([10.2, 10.3, 10.4, 10.6, 10.7, 10.8])
      expect(toKeep.map(v => v.price).sort().toArray()).toEqual([])
      expect(toPlace.map(v => v.price).sort().toArray()).toEqual([110.2, 110.3, 110.4, 110.6, 110.7, 110.8])
    })

    it('if current is full and future is has some overlap, then some to cancel, some to keep, some to place', () => {
      const current = fullBook.orders
      const shiftedPrice = current.filter(each => each.isAsk).first().price
      const future = spread.generateOrdersFor(shiftedPrice, currencies)
      expect(price).toBe(10.5)
      expect(shiftedPrice).toBe(10.6)
      expect(current.map(v => v.price).sort().toArray()).toEqual([10.2, 10.3, 10.4, 10.6, 10.7, 10.8])
      expect(future.map(v => v.price).sort().toArray()).toEqual([10.3, 10.4, 10.5, 10.7, 10.8, 10.9])

      const {toCancel, toKeep, toPlace} = groupByCancelKeepPlace(current, future)
      expect(toCancel.map(v => v.price).sort().toArray()).toEqual([10.2, 10.6])
      expect(toKeep.map(v => v.price).sort().toArray()).toEqual([10.3, 10.4, 10.7, 10.8])
      expect(toPlace.map(v => v.price).sort().toArray()).toEqual([10.5, 10.9])
    })

    it('if current is full and future is has some overlap in price range, then all to cancel, 0 to keep, all to place', () => {
      const current = fullBook.orders
      const shiftedPrice = 10.61
      const future = spread.generateOrdersFor(shiftedPrice, currencies)
      expect(price).toBe(10.5)
      expect(shiftedPrice).toBe(10.61)
      expect(current.map(v => v.price).sort().toArray()).toEqual([10.2, 10.3, 10.4, 10.6, 10.7, 10.8])
      expect(future.map(v => v.price).sort().toArray()).toEqual([10.31, 10.41, 10.51, 10.71, 10.81, 10.91])

      const {toCancel, toKeep, toPlace} = groupByCancelKeepPlace(current, future)
      expect(toCancel.map(v => v.price).sort().toArray()).toEqual([10.2, 10.3, 10.4, 10.6, 10.7, 10.8])
      expect(toKeep.map(v => v.price).sort().toArray()).toEqual([])
      expect(toPlace.map(v => v.price).sort().toArray()).toEqual([10.31, 10.41, 10.51, 10.71, 10.81, 10.91 ])
    })
  })

})
