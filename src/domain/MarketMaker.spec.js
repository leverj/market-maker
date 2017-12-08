import config from 'config'
import * as matchers from 'jest-immutable-matchers'
import Exchange from './Exchange'
import StubbedGateway from '../common/test_helpers/StubbedGateway'
import {sleep} from '../common/promises'
import SpreadStrategy from './SpreadStrategy'
import CurrencyPair from './CurrencyPair'
import Order from './Order'
import OrderBook from './OrderBook'
import MarketMaker, {groupByCancelKeepPlace} from './MarketMaker'


describe('MarketMaker', () => {
  const conf = {
    currencies: {primary: 'LEV', secondary: 'ETH'},
    spread: {type: 'fixed', depth: 3, quantity: 2, step: 0.1},
    trades: {limit: 100, timeout: 1000},
    save_changes: false
  }
  const currencies = CurrencyPair.fromConfig(conf.currencies)
  const spread = SpreadStrategy.fromConfig(conf.spread)
  const price = 10.50
  const fullBook = OrderBook.of(
    currencies,
    spread.applyTo(price, currencies).map((each, i) => each.placeWith(`id_${i}`)))
  const emptyBook = OrderBook.of(currencies)

  const synchronizedMarketMaker = async (book) => {
    const maker = makeMarketMaker(book)
    await maker.synchronize()
    return maker
  }

  const makeMarketMaker = (book) => {
    const exchange = new Exchange(new StubbedGateway())
    const maker = MarketMaker.fromConfig(exchange, conf)
    maker.exchange.gateway.setBook(book)
    maker.exchange.gateway.setExchangeRate(price)
    return maker
  }

  describe("construction", () => {
    it('from config', () => {
      const marketMaker = MarketMaker.fromConfig(new Exchange(new StubbedGateway()), conf)
      expect(marketMaker.book.orders.size).toBe(0)
      expect(marketMaker.strategy.depth).toBe(3)
      expect(marketMaker.currencies).toBe(currencies)
      expect(marketMaker.saveChanges).toBe(false)
    })

    it('from config file', () => {
      const conf = config.get('markets')[0]
      const marketMaker = MarketMaker.fromConfig(new Exchange(new StubbedGateway()), conf)
      expect(marketMaker.book.orders.size).toBe(0)
      expect(marketMaker.strategy.depth).toBe(3)
      expect(marketMaker.currencies).toBe(currencies)
      expect(marketMaker.saveChanges).toBe(true)
    })
  })

  describe("synchronize: after creation, synchronize with exchange's pending orders", () => {
    beforeEach(() => jest.addMatchers(matchers))

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
      expect(order.remaining).toBe(2)
      const notInTheBookTrade = order.less(1).placeWith('not-in-the-book-id')
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
      await sleep(10) //give time for the trades queue to process
      expect(marketMaker.book.orders.size).toBe(fullBook.size)
      expect(marketMaker.book.getOrder(order.id).remaining).toBe(2)
    })

    it('respondTo(partial trade) => order is not fulfilled', async () => {
      const marketMaker = await synchronizedMarketMaker(fullBook)
      const order = marketMaker.book.bids.first()
      const trade = order.less(1)
      expect(order.remaining).toBe(2)
      expect(trade.remaining).toBe(1)
      expect(trade.isPartial).toBe(true)

      expect(marketMaker.book.getOrder(order.id).remaining).toBe(2)
      await marketMaker.respondTo(trade)
      await sleep(10) //give time for the trades queue to process
      expect(marketMaker.book.getOrder(order.id).remaining).toBe(1)
    })

    it('respondTo(full trade) => order is fulfilled, and is off the book', async () => {
      const marketMaker = await synchronizedMarketMaker(fullBook)
      const order = marketMaker.book.bids.first()
      const trade = order.less(order.quantity)
      expect(order.remaining).toBe(2)
      expect(trade.remaining).toBe(0)
      expect(trade.isFulfilled).toBe(true)

      expect(marketMaker.book.getOrder(order.id).remaining).toBe(2)
      await marketMaker.respondTo(trade)
      await sleep(10) //give time for the trades queue to process
      expect(marketMaker.book.hasOrder(order.id)).toBe(false)
    })
  })

  describe("groupByCancelKeepPlace(current, future)", () => {
    it('if current is empty and future is not, then 0 to cancel, 0 to keep, all to place', () => {
      const current = emptyBook.orders
      const shiftedPrice = price
      const future = spread.applyTo(shiftedPrice, currencies)
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
      const future = spread.applyTo(shiftedPrice, currencies)
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
      const future = spread.applyTo(shiftedPrice, currencies)
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
      const future = spread.applyTo(shiftedPrice, currencies)
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
      const future = spread.applyTo(shiftedPrice, currencies)
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
