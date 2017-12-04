import {List} from 'immutable'
import SpreadStrategy from './SpreadStrategy'
import CurrencyPair from "./CurrencyPair"


describe('Spread Strategy', () => {
  const currencies = CurrencyPair.of('LEV', 'ETH')
  
  it('should construct from config', () => {
    const fixed = SpreadStrategy.fromConfig({ type: 'fixed', depth: 3, quantity: 1, step: 0.1 })
    expect(fixed.depth).toBe(3)
    expect(fixed.quantity).toBe(1)
    expect(fixed.step).toBe(0.1)
  })

  describe('fixed spread', () => {
    const depth = 3, quantity = 1, step = 0.1
    const spread = SpreadStrategy.fixed(depth, quantity, step)

    describe('generating orders', () => {
      it('should generate symmetric bid & ask orders', () => {
        const price = 10.50
        const orders = spread.applyTo(price, currencies)
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

    it('a fixed spread should have valid depth, quantity, and step', () => {
      const depth = 3, quantity = 1, step = 0.1
      expect(() => { SpreadStrategy.fixed(0, quantity, step) }).toThrow(/depth must be 1 or greater/)
      expect(() => { SpreadStrategy.fixed(depth, 0, step) }).toThrow(/quantity must be 1 or greater/)
      expect(() => { SpreadStrategy.fixed(depth, quantity, 0) }).toThrow(/step must be positive price increment/)
      expect(() => { SpreadStrategy.fixed(depth, quantity, -0.1) }).toThrow(/step must be positive price increment/)
    })
  })

})