import {List} from 'immutable'
import SpreadStrategy from "./SpreadStrategy"
import {Side} from "./orders"
import {Asset} from "./assets"


describe('Spread Strategy', () => {
  const assets = Asset.pair(Asset.LEV(), Asset.ETH())

  describe('fixed spread', () => {
    const depth = 3, quantity = 1, step = 0.1
    const spread = SpreadStrategy.fixed(depth, quantity, step)

    describe('generating orders', () => {
      it('should generate symmetric buy & sell orders', () => {
        const price = 10.50
        const orders = spread.generateOrdersFor(price, assets)
        const buys = orders.filter(each => each.side == Side.buy)
        const sells = orders.filter(each => each.side == Side.sell)

        expect(orders.size).toBe(spread.depth * 2)
        expect(buys.size).toBe(spread.depth)
        expect(sells.size).toBe(spread.depth)
        expect(buys.map(each => each.price)).toEqual(List.of(10.4, 10.3, 10.2))
        expect(sells.map(each => each.price)).toEqual(List.of(10.6, 10.7, 10.8))
        orders.forEach(each => expect(each.quantity).toBe(spread.quantity))
      })
    })

  })

})