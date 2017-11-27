import {List, Map} from 'immutable'
import SpreadStrategy from '../domain/SpreadStrategy'
import OrderBook from '../domain/OrderBook'
import Order from '../domain/Order'
import MarketMaker from '../domain/MarketMaker'
import reducer from './reducer'
import {types} from './actions'
import {currencies, emptyBook, newExchange, toBookMap} from '../common/test_helpers/fixtures'

describe.skip('application logic', () => {
  const spread = SpreadStrategy.fixed(3, 2, 0.1)
  const price = 10.50
  const orders = spread.generateOrdersFor(price, currencies).map((each, index) => each.placeWith(`id_${index}`))
  const bids = orders.filter(each => each.isBid)
  const asks = orders.filter(each => each.isAsk)
  const fullBook = OrderBook.of(currencies, orders)

  describe('setBook', () => {

    it('adds the book to the state', () => {
      const state = Map()
      const nextState = actions.setBook(state, emptyBook)
      expect(nextState).toEqual(toBookMap(emptyBook))
    })

    it('converts to immutable', () => {
      const state = Map()
      const nextState = actions.setBook(state, fullBook)
      expect(nextState).toEqual(toBookMap(fullBook))
    })

  })

  it('nextTrade', () => {
    const state = toBookMap(fullBook)
    const nextState = actions.nextTrade(state)
    expect(nextState).toEqual(undefined)

  })

})