import {fromJS, List, Map} from 'immutable'
import * as fixtures from '../common/test_helpers/fixtures'
import {toBookMap} from '../common/test_helpers/fixtures'
import Order from '../domain/Order'
import OrderBook from '../domain/OrderBook'
import reducer from './reducer'
import {types} from './actions'


describe.skip('reducer', () => {
  const currencies = fixtures.currencies
  const orders = List.of(
    Order.ask(10, 11.75, currencies).placeWith('id_1', now),
    Order.bid(20, 11.25, currencies).placeWith('id_4', now),
  )
  const book = OrderBook.of(currencies, orders)

  it('has an initial state', () => {
    const action = types.set(book)
    const nextState = reducer(undefined, action)
    expect(nextState).toEqual(toBookMap(book))
  })

  it('handles SET', () => {
    const initialState = Map()
    const action = types.set(book)
    const nextState = reducer(initialState, action)
    expect(nextState).toEqual(toBookMap(book))
  })

  it('handles NEXT', async () => {
    const marketMaker = await fixtures.marketMaker()
    const trade = null
    const action = types.next(marketMaker, trade)
    const initialState = book.map
    const nextState = reducer(initialState, action)
    expect(nextState).toEqual(toBookMap(fixtures.emptyBook)) //fixme: construct expected book
  })

  it('handles SYNCHRONIZE', async () => {
    const initialState = book.map
    //fixme: change (add/modify/delete) the marketMaker orders
    const marketMaker = await fixtures.marketMaker()
    const action = types.synchronize(marketMaker)
    const nextState = reducer(initialState, action)
    expect(nextState).toEqual(toBookMap(fixtures.emptyBook)) //fixme: construct expected book
  })

  it('can be used with reduce', async () => {
    const marketMaker = await fixtures.marketMaker()
    const trade1 = null
    const trade2 = null
    const actions = [
      types.set(book),
      types.next(marketMaker, trade1),
      types.next(marketMaker, trade2),
      types.synchronize(marketMaker),
    ]
    const finalState = actions.reduce(reducer, Map())
    expect(finalState).toEqual(toBookMap(fixtures.emptyBook)) //fixme: construct expected book
  })

})