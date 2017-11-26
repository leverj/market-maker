import {fromJS, Map} from 'immutable'
import * as fixtures from '../common/test_helpers/fixtures'
import makeStore from './store'
import {actionCreators} from './actions'

describe('store', () => {

  it('is a Redux store configured with the correct reducer', () => {
    const store = makeStore()
    expect(store.getState()).toEqual(Map())

    const book = fixtures.emptyBook
    store.dispatch(actionCreators.set(book))
    expect(store.getState()).toEqual(toState(book))
  })

})

const toState = (book) => fromJS({ book: book.map })