import {lev2eth} from '../helpers/test_fixtures'
import {List} from 'immutable'
import SpreadStrategy from './SpreadStrategy'


describe('Spread Strategy', () => {
  const currencies = lev2eth

  describe('fixed spread', () => {
    const depth = 3, quantity = 1, step = 0.1
    const spread = SpreadStrategy.fixed(depth, quantity, step)

    describe('generating orders', () => {
      it('should generate symmetric bid & ask orders', () => {
        const price = 10.50
        const orders = spread.generateOrdersFor(price, currencies)
        const bids = orders.filter(each => each.isBid)
        const asks = orders.filter(each => each.isAsk)

        expect(orders.size).toBe(spread.depth * 2)
        expect(bids.size).toBe(spread.depth)
        expect(asks.size).toBe(spread.depth)
        expect(bids.map(each => each.price)).toEqual(List.of(10.4, 10.3, 10.2))
        expect(asks.map(each => each.price)).toEqual(List.of(10.6, 10.7, 10.8))
        orders.forEach(each => expect(each.quantity).toBe(spread.quantity))
      })
    })

  })

})