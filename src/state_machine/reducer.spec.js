import { Map} from 'immutable'
import SpreadStrategy from '../domain/SpreadStrategy'
import OrderBook from '../domain/OrderBook'
import MarketMaker from '../domain/MarketMaker'
import reducer from './reducer'
import {types} from './actions'
import {currencies, emptyBook, newExchange, toBookMap} from '../common/test_helpers/fixtures'
import * as fixtures from '../common/test_helpers/fixtures'


describe('reducer', () => {
// describe.skip('reducer', () => {
  const spread = SpreadStrategy.fixed(3, 2, 0.1)
  const price = 10.50
  const orders = spread.generateOrdersFor(price, currencies).map((each, index) => each.placeWith(`id_${index}`))
  const bids = orders.filter(each => each.isBid)
  const asks = orders.filter(each => each.isAsk)
  // expect(bids.map(each => each.price)).toEqual(List.of(10.4, 10.3, 10.2))
  // expect(asks.map(each => each.price)).toEqual(List.of(10.6, 10.7, 10.8))
  const fullBook = OrderBook.of(currencies, orders)

  it('has an initial state', () => {
    const action = types.setBook(fullBook)
    const nextState = reducer(undefined, action)
    expect(nextState).toEqual(toBookMap(fullBook))
  })

  it('handles SET_BOOK from initial state', () => {
    const initialState = Map()
    expect(reducer(initialState, types.setBook(emptyBook))).toEqual(toBookMap(emptyBook))
    expect(reducer(initialState, types.setBook(fullBook))).toEqual(toBookMap(fullBook))
  })

  it('handles SET_BOOK in sequence', async () => {
    const initialState = Map()
    const nextState = await reducer(initialState, types.setBook(emptyBook))
    expect(nextState).toEqual(toBookMap(emptyBook))

    const nextNextState = await reducer(nextState, types.setBook(fullBook))
    expect(nextNextState).toEqual(toBookMap(fullBook))
  })

  it('handles NEXT_TRADE with partial trade => order is not fulfilled', async () => {
    const marketMaker = MarketMaker.of(newExchange(), spread, currencies)
    const order = bids.first()
    const trade = order._less_(1)
    expect(order.remaining).toBe(2)
    expect(trade.remaining).toBe(1)
    expect(trade.isPartial).toBe(true)
    expect(fullBook.hasOrder(order.id))

    const initialState = await reducer(undefined, types.setBook(fullBook))
    const nextState = await reducer(initialState, types.nextTrade(marketMaker, trade))
    expect(initialState.getIn(['book', 'orders', order.id, 'remaining'])).toBe(2)
    expect(nextState.getIn(['book', 'orders', order.id, 'remaining'])).toBe(1)
  })

  it('handles NEXT_TRADE with full trade => order is fulfilled, and is off the book', async () => {
    const marketMaker = MarketMaker.of(newExchange(), spread, currencies)
    const order = bids.first()
    const trade = order._less_(order.quantity)
    expect(order.remaining).toBe(2)
    expect(trade.remaining).toBe(0)
    expect(fullBook.hasOrder(order.id))

    marketMaker.exchange.gateway.exchangeRate = order.price
    const initialState = await reducer(Map(), types.setBook(fullBook))
    const nextState = await reducer(initialState, types.nextTrade(marketMaker, trade))
    expect(initialState.getIn(['book', 'orders', order.id, 'remaining'])).toBe(2)
    expect(nextState.hasIn(['book', 'orders', order.id])).toBe(false)
  })

  it.skip('handles SYNCHRONIZE_WITH_EXCHANGE', async () => {
    const initialState = fullBook.map
    //fixme: change (add/modify/delete) the marketMaker orders
    const marketMaker = await fixtures.newMarketMaker()
    const action = types.synchronizeWithExchange(marketMaker)
    const nextState = await reducer(initialState, action)
    expect(nextState).toEqual(toBookMap(fixtures.emptyBook)) //fixme: construct expected book
  })

  it.skip('can be used with reduce', async () => {
    const marketMaker = MarketMaker.of(newExchange(), spread, currencies)
    marketMaker.exchange.gateway.setBook(fullBook)
    const trade1 = bids.first()._less_(1)
    const trade2 = asks.first()._less_(1)
    const actions = [
      types.synchronizeWithExchange(marketMaker),
      types.nextTrade(marketMaker, trade1),
      types.nextTrade(marketMaker, trade2),
      types.synchronizeWithExchange(marketMaker),
      types.setBook(emptyBook),
    ]
    const finalState = actions.reduce(reducer, Map())
    expect(finalState).toEqual(toBookMap(emptyBook)) //fixme: construct expected book
  })

})