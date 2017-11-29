import {List, Map} from 'immutable'
import makeStore from './store'
import {actionTypes} from './actions'
import * as fixtures from '../common/test_helpers/fixtures'
import {toBookMap} from '../common/test_helpers/fixtures'
import Order from '../domain/Order'
import OrderBook from '../domain/OrderBook'


describe('store', () => {

  it('is a Redux store configured with the correct reducer', () => {
    const store = makeStore()
    expect(store.getState()).toEqual(Map())

    store.dispatch(actionTypes.setBook(fixtures.emptyBook))
    expect(store.getState()).toEqual(toBookMap(fixtures.emptyBook))

    const book = OrderBook.of(fixtures.currencies, List.of(
      Order.ask(10, 11.75, fixtures.currencies).placeWith('id_1'),
      Order.bid(20, 11.25, fixtures.currencies).placeWith('id_2'),
    ))
    store.dispatch(actionTypes.setBook(book))
    expect(store.getState()).toEqual(toBookMap(book))
  })

})
