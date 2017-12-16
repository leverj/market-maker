import config from 'config'
import {List} from 'immutable'
import SpreadStrategy from './SpreadStrategy'
import CurrencyPair from "./CurrencyPair"


describe('Spread Strategy', () => {
  const currencies = CurrencyPair.of('LEV', 'ETH')
  
  it('construct from config', () => {
    const fixed = SpreadStrategy.fromConfig({ type: 'fixed', depth: 3, quantity: 1, step: 0.1 })
    expect(fixed.depth).toBe(3)
    expect(fixed.quantity).toBe(1)
    expect(fixed.step).toBe(0.1)
  })

  it('construct from config file', () => {
    const conf = config.get('markets')[0].spread
    const fixed = SpreadStrategy.fromConfig(conf)
    expect(fixed.depth).toBe(3)
    expect(fixed.quantity).toBe(1)
    expect(fixed.step).toBe(0.1)
  })

  describe('fixed spread', () => {
    it('generating orders', () => {
      const depth = 3, quantity = 20, step = 5
      const spread = SpreadStrategy.fixed(depth, quantity, step)
      const price = 100.00
      const orders = spread.applyTo(price, currencies).sortBy(each => each.price)
      expect(orders.map(each => each.price)).toEqual(List.of(85, 90, 95, 105, 110, 115))
      expect(orders.map(each => each.quantity)).toEqual(List.of(20, 20, 20, 20, 20, 20))
    })

    it('generate symmetric bid & ask orders', () => {
      const depth = 3, quantity = 1, step = 0.1
      const spread = SpreadStrategy.fixed(depth, quantity, step)
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

    it('a fixed spread has valid depth, quantity, and step', () => {
      const depth = 3, quantity = 1, step = 0.1
      expect(() => SpreadStrategy.fixed(0, quantity, step)).toThrow(/depth must be 1 or greater/)
      expect(() => SpreadStrategy.fixed(depth, 0, step)).toThrow(/quantity must be 1 or greater/)
      expect(() => SpreadStrategy.fixed(depth, quantity, 0)).toThrow(/step must be a positive price increment/)
      expect(() => SpreadStrategy.fixed(depth, quantity, -0.1)).toThrow(/step must be a positive price increment/)
    })
  })

  describe('linear spread', () => {
    it('generating orders', () => {
      const depth = 3, quantity = 20, step = 5, factor = 0.2
      const spread = SpreadStrategy.linear(depth, quantity, step, factor)
      const price = 100.00
      const orders = spread.applyTo(price, currencies).sortBy(each => each.price)
      expect(orders.map(each => each.price)).toEqual(List.of(85, 90, 95, 105, 110, 115))
      expect(orders.map(each => each.quantity)).toEqual(List.of(28, 24, 20, 20, 24, 28))
    })
  })

  describe('ratio spread', () => {
    it('generating orders', () => {
      const depth = 3, quantity = 20, ratio = 0.10
      const spread = SpreadStrategy.ratio(depth, quantity, ratio)
      const price = 100.00
      const orders = spread.applyTo(price, currencies).sortBy(each => each.price)
      expect(orders.map(each => each.price)).toEqual(List.of(70, 80, 90, 110, 120, 130))
      expect(orders.map(each => each.quantity)).toEqual(List.of(24, 22, 20, 20, 22, 24))
    })
  })

  describe('logarithmic spread', () => {
    it('generating orders', () => {
      const depth = 3, quantity = 20, factor = 10
      const spread = SpreadStrategy.logarithmic(depth, quantity, factor)
      const price = 100.05
      const orders = spread.applyTo(price, currencies).sortBy(each => each.price)
      expect(orders.map(each => each.price)).toEqual(List.of(96.57, 96.75, 97.05, 103.05, 103.35, 103.53))
      expect(orders.map(each => each.quantity)).toEqual(List.of(25, 22, 20, 20, 22, 25))
    })
  })

})