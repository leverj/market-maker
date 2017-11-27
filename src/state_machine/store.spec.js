import {List, Map} from 'immutable'
import makeStore from './store'
import {types} from './actions'
import * as fixtures from '../common/test_helpers/fixtures'
import {toBookMap} from '../common/test_helpers/fixtures'
import Order from '../domain/Order'
import OrderBook from '../domain/OrderBook'


describe.skip('store', () => {

  it('is a Redux store configured with the correct reducer', () => {
    const store = makeStore()
    expect(store.getState()).toEqual(Map())

    store.dispatch(types.setBook(fixtures.emptyBook))
    expect(store.getState()).toEqual(toBookMap(fixtures.emptyBook))

    const book = OrderBook.of(fixtures.currencies, List.of(
      Order.ask(10, 11.75, fixtures.currencies).placeWith('id_1'),
      Order.bid(20, 11.25, fixtures.currencies).placeWith('id_4'),
    ))
    store.dispatch(types.setBook(book))
    expect(store.getState()).toEqual(toBookMap(book))
  })

})
