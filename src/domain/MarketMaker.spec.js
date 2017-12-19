import config from 'config'
import StubbedGateway from '../gateways/StubbedGateway'
import {sleep} from '../common/promises'
import Exchange from './Exchange'
import SpreadStrategy from './SpreadStrategy'
import CurrencyPair from './CurrencyPair'
import Order from './Order'
import OrderBook from './OrderBook'
import MarketMaker, {groupByCancelKeepPlace} from './MarketMaker'
import {List} from "immutable"


describe('MarketMaker', () => {
  const conf = {
    currencies: {primary: 'LEV', secondary: 'ETH'},
    spread: {type: 'fixed', precision: 2, depth: 3, quantity: 2, step: 0.1},
    jobs: {limit: 100, timeout: 1000},
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
      expect(marketMaker.saveChanges).toBe(false)
    })
  })

  describe("synchronize: after creation, synchronize with exchange's pending orders", () => {
    it('if the exchange has pending orders, retrieve them', async () => {
      expect(getPrices(fullBook.orders)).toEqual([10.2, 10.3, 10.4, 10.6, 10.7, 10.8])

      const marketMaker = makeMarketMaker(fullBook)
      expect(marketMaker.book.orders.map(each => each.price)).toEqual(List.of())
      expect(getPrices(marketMaker.book.orders)).toEqual([])

      await marketMaker.synchronize()
      expect(getPrices(marketMaker.book.orders)).toEqual([10.2, 10.3, 10.4, 10.6, 10.7, 10.8])
    })

    it('if the exchange has no orders, re-spread with new orders', async () => {
      const marketMaker = makeMarketMaker(emptyBook)
      expect(getPrices(marketMaker.book.orders)).toEqual([])

      await marketMaker.synchronize()
      expect(getPrices(marketMaker.book.orders)).toEqual([10.2, 10.3, 10.4, 10.6, 10.7, 10.8])
    })
  })

  describe('respondToPriceChange', () => {
    it('sanity check: start with a blank exchange, do not synchronize, then respond to first ever price change', async () => {
      const marketMaker = makeMarketMaker(emptyBook)
      expect(getPrices(marketMaker.book.orders)).toEqual([])

      const shiftedPrice = price
      marketMaker.exchange.gateway.setExchangeRate(shiftedPrice)
      marketMaker.respondToPriceChange(shiftedPrice)
      await sleep(10)
      expect(getPrices(marketMaker.book.orders)).toEqual([10.2, 10.3, 10.4, 10.6, 10.7, 10.8])
    })

    it('price changed ... not really', async () => {
      const initialPrice = price
      const marketMaker = await synchronizedMarketMaker(fullBook)
      expect(getPrices(marketMaker.book.orders)).toEqual([10.2, 10.3, 10.4, 10.6, 10.7, 10.8])

      const shiftedPrice = initialPrice
      marketMaker.exchange.gateway.setExchangeRate(shiftedPrice)
      marketMaker.respondToPriceChange(shiftedPrice)
      await sleep(10)
      expect(getPrices(marketMaker.book.orders)).toEqual([10.2, 10.3, 10.4, 10.6, 10.7, 10.8])
    })

    it('price changed to make existing book completely irrelevant', async () => {
      const initialPrice = price
      const marketMaker = await synchronizedMarketMaker(fullBook)
      expect(getPrices(marketMaker.book.orders)).toEqual([10.2, 10.3, 10.4, 10.6, 10.7, 10.8])

      const shiftedPrice = initialPrice * 2
      marketMaker.exchange.gateway.setExchangeRate(shiftedPrice)
      marketMaker.respondToPriceChange(shiftedPrice)
      await sleep(10)
      expect(getPrices(marketMaker.book.orders)).toEqual([20.7, 20.8, 20.9, 21.1, 21.2, 21.3])
    })

    it('price changed to make existing book partially irrelevant', async () => {
      const marketMaker = await synchronizedMarketMaker(fullBook)
      expect(getPrices(marketMaker.book.orders)).toEqual([10.2, 10.3, 10.4, 10.6, 10.7, 10.8])

      const shiftedPrice = 10.6
      marketMaker.exchange.gateway.setExchangeRate(shiftedPrice)
      marketMaker.respondToPriceChange(shiftedPrice)
      await sleep(10)
      expect(getPrices(marketMaker.book.orders)).toEqual([10.3, 10.4, 10.5, 10.7, 10.8, 10.9])
    })

    it('price changed to make existing book overlap in price range but completely irrelevant', async () => {
      const marketMaker = await synchronizedMarketMaker(fullBook)
      expect(getPrices(marketMaker.book.orders)).toEqual([10.2, 10.3, 10.4, 10.6, 10.7, 10.8])

      const shiftedPrice = 10.61
      marketMaker.exchange.gateway.setExchangeRate(shiftedPrice)
      marketMaker.respondToPriceChange(shiftedPrice)
      await sleep(10)
      expect(getPrices(marketMaker.book.orders)).toEqual([10.31, 10.41, 10.51, 10.71, 10.81, 10.91])
    })
  })

  describe('respondToTrade(trade)', () => {
    it('respondToTrade(unrelated trade) => nothing changes', async () => {
      const marketMaker = await synchronizedMarketMaker(fullBook)
      const order = marketMaker.book.bids.first()
      expect(order.remaining).toBe(2)
      const notInTheBookTrade = order.less(1).placeWith('not-in-the-book-id')
      expect(order.remaining).toBe(2)
      expect(notInTheBookTrade.remaining).toBe(1)

      expect(marketMaker.book.orders.size).toBe(fullBook.size)
      expect(marketMaker.book.getOrder(order.id).remaining).toBe(2)

      await marketMaker.respondToTrade(notInTheBookTrade)
      expect(marketMaker.book.orders.size).toBe(fullBook.size)
      expect(marketMaker.book.getOrder(order.id).remaining).toBe(2)

      // order with all  the same but the side
      const unrelatedTrade = Order.ask(order.quantity, order.price, order.currencies).placeWith(order.id, order.timestamp)
      await marketMaker.respondToTrade(unrelatedTrade)
      await sleep(10) //give time for the trades queue to process
      expect(marketMaker.book.orders.size).toBe(fullBook.size)
      expect(marketMaker.book.getOrder(order.id).remaining).toBe(2)
    })

    it('respondToTrade(partial trade) => order is not fulfilled', async () => {
      const marketMaker = await synchronizedMarketMaker(fullBook)
      const order = marketMaker.book.bids.first()
      const trade = order.less(1)
      expect(order.remaining).toBe(2)
      expect(trade.remaining).toBe(1)
      expect(trade.isFilling).toBe(true)

      expect(marketMaker.book.getOrder(order.id).remaining).toBe(2)
      await marketMaker.respondToTrade(trade)
      await sleep(10) //give time for the trades queue to process
      expect(marketMaker.book.getOrder(order.id).remaining).toBe(1)
    })

    it('respondToTrade(full trade) => order is fulfilled, and is off the book', async () => {
      const marketMaker = await synchronizedMarketMaker(fullBook)
      const order = marketMaker.book.bids.first()
      const trade = order.less(order.quantity)
      expect(order.remaining).toBe(2)
      expect(trade.remaining).toBe(0)
      expect(trade.isFilled).toBe(true)

      expect(marketMaker.book.getOrder(order.id).remaining).toBe(2)
      await marketMaker.respondToTrade(trade)
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
      expect(getPrices(current)).toEqual([])
      expect(getPrices(future)).toEqual([10.2, 10.3, 10.4, 10.6, 10.7, 10.8])

      const {toCancel, toKeep, toPlace} = groupByCancelKeepPlace(current, future)
      expect(getPrices(toCancel)).toEqual([])
      expect(getPrices(toKeep)).toEqual([])
      expect(getPrices(toPlace)).toEqual([10.2, 10.3, 10.4, 10.6, 10.7, 10.8])
    })

    it('if current is full and future is equivalent, then 0 to cancel, all to keep, 0 to place', () => {
      const current = fullBook.orders
      const shiftedPrice = price
      const future = spread.applyTo(shiftedPrice, currencies)
      expect(shiftedPrice).toBe(10.5)
      expect(getPrices(current)).toEqual([10.2, 10.3, 10.4, 10.6, 10.7, 10.8])
      expect(getPrices(future)).toEqual([10.2, 10.3, 10.4, 10.6, 10.7, 10.8])

      const {toCancel, toKeep, toPlace} = groupByCancelKeepPlace(current, future)
      expect(getPrices(toCancel)).toEqual([])
      expect(getPrices(toKeep)).toEqual([10.2, 10.3, 10.4, 10.6, 10.7, 10.8])
      expect(getPrices(toPlace)).toEqual([])
    })

    it('if current is full and future is totally different, then all current to cancel, 0 to keep, all future to place', () => {
      const current = fullBook.orders
      const shiftedPrice = price + 100
      const future = spread.applyTo(shiftedPrice, currencies)
      expect(price).toBe(10.5)
      expect(shiftedPrice).toBe(110.5)
      expect(getPrices(current)).toEqual([10.2, 10.3, 10.4, 10.6, 10.7, 10.8])
      expect(getPrices(future)).toEqual([110.2, 110.3, 110.4, 110.6, 110.7, 110.8])

      const {toCancel, toKeep, toPlace} = groupByCancelKeepPlace(current, future)
      expect(getPrices(toCancel)).toEqual([10.2, 10.3, 10.4, 10.6, 10.7, 10.8])
      expect(getPrices(toKeep)).toEqual([])
      expect(getPrices(toPlace)).toEqual([110.2, 110.3, 110.4, 110.6, 110.7, 110.8])
    })

    it('if current is full and future is has some overlap, then some to cancel, some to keep, some to place', () => {
      const current = fullBook.orders
      const shiftedPrice = current.filter(each => each.isAsk).first().price
      const future = spread.applyTo(shiftedPrice, currencies)
      expect(price).toBe(10.5)
      expect(shiftedPrice).toBe(10.6)
      expect(getPrices(current)).toEqual([10.2, 10.3, 10.4, 10.6, 10.7, 10.8])
      expect(getPrices(future)).toEqual([10.3, 10.4, 10.5, 10.7, 10.8, 10.9])

      const {toCancel, toKeep, toPlace} = groupByCancelKeepPlace(current, future)
      expect(getPrices(toCancel)).toEqual([10.2, 10.6])
      expect(getPrices(toKeep)).toEqual([10.3, 10.4, 10.7, 10.8])
      expect(getPrices(toPlace)).toEqual([10.5, 10.9])
    })

    it('if current is full and future has some overlap in price range, then all to cancel, 0 to keep, all to place', () => {
      const current = fullBook.orders
      const shiftedPrice = 10.61
      const future = spread.applyTo(shiftedPrice, currencies)
      expect(price).toBe(10.5)
      expect(shiftedPrice).toBe(10.61)
      expect(getPrices(current)).toEqual([10.2, 10.3, 10.4, 10.6, 10.7, 10.8])
      expect(getPrices(future)).toEqual([10.31, 10.41, 10.51, 10.71, 10.81, 10.91])

      const {toCancel, toKeep, toPlace} = groupByCancelKeepPlace(current, future)
      expect(getPrices(toCancel)).toEqual([10.2, 10.3, 10.4, 10.6, 10.7, 10.8])
      expect(getPrices(toKeep)).toEqual([])
      expect(getPrices(toPlace)).toEqual([10.31, 10.41, 10.51, 10.71, 10.81, 10.91 ])
    })
  })

})

const getPrices = (orders) => orders.map(each => each.price).sort().toArray()
