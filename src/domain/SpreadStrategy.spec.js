import {List} from 'immutable'
import {SpreadStrategy} from "./SpreadStrategy"
import {Way} from "./Order"
import {Currency} from "./Currency"


describe('Spread Strategy', () => {
  const currencies = Currency.pair(Currency.LEV(), Currency.ETH())

  describe('fixed spread', () => {
    const depth = 3, amount = 1, step = 0.1
    const spread = SpreadStrategy.fixed(depth, amount, step)

    describe('generating orders', () => {
      it('should generate symmetric bid & ask orders', () => {
        const price = 10.50
        const orders = spread.generateOrdersFor(price, currencies)
        const bids = orders.filter(each => each.way == Way.bid)
        const asks = orders.filter(each => each.way == Way.ask)

        expect(orders.size).toBe(spread.depth * 2)
        expect(bids.size).toBe(spread.depth)
        expect(asks.size).toBe(spread.depth)
        expect(bids.map(each => each.price)).toEqual(List.of(10.4, 10.3, 10.2))
        expect(asks.map(each => each.price)).toEqual(List.of(10.6, 10.7, 10.8))
        orders.forEach(each => expect(each.amount).toBe(spread.amount))
      })
    })

  })

})