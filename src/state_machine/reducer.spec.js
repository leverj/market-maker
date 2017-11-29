import { Map} from 'immutable'
import SpreadStrategy from '../domain/SpreadStrategy'
import OrderBook from '../domain/OrderBook'
import MarketMaker from '../domain/MarketMaker'
import reducer from './reducer'
import {actionTypes} from './actions'
import makeStore from './store'
import {currencies, emptyBook, newExchange, toBookMap} from '../common/test_helpers/fixtures'
import * as fixtures from '../common/test_helpers/fixtures'


describe('reducer', () => {
  const spread = SpreadStrategy.fixed(3, 2, 0.1)
  const price = 10.50
  const orders = spread.generateOrdersFor(price, currencies).map((each, index) => each.placeWith(`id_${index}`))
  const bids = orders.filter(each => each.isBid)
  const asks = orders.filter(each => each.isAsk)
  // expect(bids.map(each => each.price)).toEqual(List.of(10.4, 10.3, 10.2))
  // expect(asks.map(each => each.price)).toEqual(List.of(10.6, 10.7, 10.8))
  const fullBook = OrderBook.of(currencies, orders)
  const marketMaker = MarketMaker.of(makeStore(), newExchange(), spread, currencies)

  it('has an initial state', () => {
    const action = actionTypes.setBook(fullBook)
    const nextState = reducer(undefined, action)
    expect(nextState).toEqual(toBookMap(fullBook))
  })

  it('handles SET_BOOK from initial state', () => {
    const initialState = Map()
    expect(reducer(initialState, actionTypes.setBook(emptyBook))).toEqual(toBookMap(emptyBook))
    expect(reducer(initialState, actionTypes.setBook(fullBook))).toEqual(toBookMap(fullBook))
  })

  it('handles SET_BOOK in sequence', async () => {
    const initialState = Map()
    const nextState = await reducer(initialState, actionTypes.setBook(emptyBook))
    expect(nextState).toEqual(toBookMap(emptyBook))

    const nextNextState = await reducer(nextState, actionTypes.setBook(fullBook))
    expect(nextNextState).toEqual(toBookMap(fullBook))
  })

  it('handles NEXT_TRADE with partial trade => order is not fulfilled', async () => {
    const order = bids.first()
    const trade = order._less_(1)
    expect(order.remaining).toBe(2)
    expect(trade.remaining).toBe(1)
    expect(trade.isPartial).toBe(true)
    expect(fullBook.hasOrder(order.id))

    const initialState = await reducer(undefined, actionTypes.setBook(fullBook))
    const nextState = await reducer(initialState, actionTypes.nextTrade(marketMaker, trade))
    expect(initialState.getIn(['book', 'orders', order.id, 'remaining'])).toBe(2)
    expect(nextState.getIn(['book', 'orders', order.id, 'remaining'])).toBe(1)
  })

  it('handles NEXT_TRADE with full trade => order is fulfilled, and is off the book', async () => {
    const order = bids.first()
    const trade = order._less_(order.quantity)
    expect(order.remaining).toBe(2)
    expect(trade.remaining).toBe(0)
    expect(fullBook.hasOrder(order.id))

    marketMaker.exchange.gateway.exchangeRate = order.price
    const initialState = await reducer(Map(), actionTypes.setBook(fullBook))
    const nextState = await reducer(initialState, actionTypes.nextTrade(marketMaker, trade))
    expect(initialState.getIn(['book', 'orders', order.id, 'remaining'])).toBe(2)
    expect(nextState.hasIn(['book', 'orders', order.id])).toBe(false)
  })

  it.skip('handles SYNCHRONIZE_WITH_EXCHANGE', async () => {
    const initialState = fullBook.map
    //fixme: change (add/modify/delete) the marketMaker orders
    const marketMaker = await fixtures.newMarketMaker()
    const action = actionTypes.synchronizeWithExchange(marketMaker)
    const nextState = await reducer(initialState, action)
    expect(nextState).toEqual(toBookMap(fixtures.emptyBook)) //fixme: construct expected book
  })

  it.skip('can be used with reduce', async () => {
    marketMaker.exchange.gateway.setBook(fullBook)
    const trade1 = bids.first()._less_(1)
    const trade2 = asks.first()._less_(1)
    const actions = [
      actionTypes.synchronizeWithExchange(marketMaker),
      actionTypes.nextTrade(marketMaker, trade1),
      actionTypes.nextTrade(marketMaker, trade2),
      actionTypes.synchronizeWithExchange(marketMaker),
      actionTypes.setBook(emptyBook),
    ]
    const finalState = actions.reduce(reducer, Map())
    expect(finalState).toEqual(toBookMap(emptyBook)) //fixme: construct expected book
  })

})