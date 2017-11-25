import {fromJS, List, Map} from 'immutable'
import * as fixtures from '../helpers/testing/fixtures'
import Order from '../domain/Order'
import OrderBook from '../domain/OrderBook'
import reducer from './reducer'
import {actionCreators} from './actions'


describe.skip('reducer', () => {
  const currencies = fixtures.currencies
  const quantity = 10, price = 110.0
  const orders = List.of(
    Order.ask(quantity, price + 5, currencies).placeWith('id_1', now),
    Order.bid(quantity, price - 5, currencies).placeWith('id_4', now),
  )
  const book = OrderBook.of(currencies, orders)

  it('has an initial state', () => {
    const action = actionCreators.set(book)
    const nextState = reducer(undefined, action)
    expect(nextState).toEqual(book.map)
  })

  it('handles SET', () => {
    const initialState = Map()
    const action = actionCreators.set(book)
    const nextState = reducer(initialState, action)
    expect(nextState).toEqual(book.map)
  })

  it('handles NEXT', async () => {
    const marketMaker = await fixtures.marketMaker()
    const trade = null
    const action = actionCreators.next(marketMaker, trade)
    const initialState = book.map
    const nextState = reducer(initialState, action)
    expect(nextState).toEqual(book) //fixme: with modified book
  })

  it('handles SYNCHRONIZE', async () => {
    const initialState = book.map
    //fixme: change (add/modify/delete) the marketMaker orders
    const marketMaker = await fixtures.marketMaker()
    const action = actionCreators.synchronize(marketMaker)
    const nextState = reducer(initialState, action)
    expect(nextState).toEqual(book) //fixme: with modified book
  })

  it('can be used with reduce', async () => {
    const marketMaker = await fixtures.marketMaker()
    const trade1 = null
    const trade2 = null
    const expected = { book: null }
    const actions = [
      actionCreators.set(book),
      actionCreators.next(marketMaker, trade1),
      actionCreators.next(marketMaker, trade2),
      actionCreators.synchronize(marketMaker),
    ]
    const finalState = actions.reduce(reducer, Map())
    expect(finalState).toEqual(fromJS(expected))
  })

})