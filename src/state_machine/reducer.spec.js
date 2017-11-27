import { Map} from 'immutable'
import SpreadStrategy from '../domain/SpreadStrategy'
import OrderBook from '../domain/OrderBook'
import Order from '../domain/Order'
import MarketMaker from '../domain/MarketMaker'
import reducer from './reducer'
import {types} from './actions'
import {currencies, emptyBook, newExchange, toBookMap} from '../common/test_helpers/fixtures'


// describe('reducer', () => {
describe.skip('reducer', () => {
  const spread = SpreadStrategy.fixed(3, 2, 0.1)
  const price = 10.50
  const orders = spread.generateOrdersFor(price, currencies).map((each, index) => each.placeWith(`id_${index}`))
  const bids = orders.filter(each => each.isBid)
  const asks = orders.filter(each => each.isAsk)
  // expect(bids.map(each => each.price)).toEqual(List.of(10.4, 10.3, 10.2))
  // expect(asks.map(each => each.price)).toEqual(List.of(10.6, 10.7, 10.8))
  const fullBook = OrderBook.of(currencies, orders)

  it('has an initial state', async () => {
    const action = types.setBook(fullBook)
    const nextState = reducer(undefined, action)
    expect(nextState).toEqual(toBookMap(fullBook))
  })

  it('handles SET_BOOK from initial state', async () => {
    const initialState = Map()
    expect(await reducer(initialState, types.setBook(emptyBook))).toEqual(toBookMap(emptyBook))
    expect(await reducer(initialState, types.setBook(fullBook))).toEqual(toBookMap(fullBook))
  })

  it('handles SET_BOOK in sequence', async () => {
    const initialState = Map()
    const nextState = await reducer(initialState, types.setBook(emptyBook))
    expect(nextState).toEqual(toBookMap(emptyBook))

    const nextNextState = await reducer(nextState, types.setBook(fullBook))
    expect(nextNextState).toEqual(toBookMap(fullBook))
  })

  it('handles NEXT_TRADE with partial trade => order is not fulfilled', async () => {
    const marketMaker = MarketMaker.of(newExchange(), spread, fullBook)
    const order = bids.first()
    const trade = order._less_(1)
    expect(order.remaining).toBe(2)
    expect(trade.remaining).toBe(1)
    expect(trade.isPartial).toBe(1)
    expect(fullBook.hasOrder(order.id))

    const initialState = toBookMap(marketMaker.book)
    const nextState = await reducer(initialState, types.nextTrade(marketMaker, trade))
    const offsetOrder = new Order(nextState.getIn(['book', 'orders', order.id]))
    expect(offsetOrder.remaining).toEqual(1)
  })

  it.skip('handles NEXT_TRADE with full trade => order is fulfilled, and is off the book', async () => {
    const marketMaker = MarketMaker.of(newExchange(), spread, fullBook)
    const order = bids.first()
    const trade = order._less_(order.quantity)
    expect(order.remaining).toBe(2)
    expect(trade.remaining).toBe(1)
    expect(fullBook.hasOrder(order.id))

    const initialState = toBookMap(marketMaker.book)
    const nextState = await reducer(initialState, types.nextTrade(marketMaker, trade))
    const offsetOrder = new Order(nextState.getIn(['book', 'orders', order.id]))
    expect(offsetOrder.remaining).toEqual(1)
  })

  it.skip('handles SYNCHRONIZE_WITH_EXCHANGE', async () => {
    const initialState = fullBook.map
    //fixme: change (add/modify/delete) the marketMaker orders
    const marketMaker = await fixtures.marketMaker()
    const action = types.synchronizeWithExchange(marketMaker)
    const nextState = await reducer(initialState, action)
    expect(nextState).toEqual(toBookMap(fixtures.emptyBook)) //fixme: construct expected book
  })

  it.skip('can be used with reduce', async () => {
    const marketMaker = await fixtures.marketMaker()
    const trade1 = order1._minus_(1.00)
    const trade2 = null
    const actions = [
      types.setBook(fullBook),
      types.nextTrade(marketMaker, trade1),
      types.nextTrade(marketMaker, trade2),
      types.synchronizeWithExchange(marketMaker),
    ]
    const finalState = actions.reduce(reducer, Map())
    expect(finalState).toEqual(toBookMap(fixtures.emptyBook)) //fixme: construct expected book
  })

})