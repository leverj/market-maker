import * as fixtures from '../helpers/test_fixtures'
import Order from './Order'
import Currency from './Currency'


describe('Order', () => {
  const currencies = fixtures.defaultCurrencyPair
  const amount = 10, price = 10.50
  const order = Order.ask(amount, price, currencies)

  describe('construction', () => {
    it('a new order has no id, and therefore is not placed yet', () => {
      expect(order.id).toBe('')
      expect(order.isPlaced).toBeFalsy()
    })

    it('an order should have valid amount & price', () => {
      expect(() => { Order.ask(-1 * amount, price, currencies) }).toThrow(/amount must be non-negative/)
      expect(() => { Order.ask(amount, -1 * price, currencies) }).toThrow(/price must be positive/)
    })

    it('an order is placed by assigning id', () => {
      const placedOrder = order.placeWithId('test-id')
      expect(order.isPlaced).toBeFalsy()
      expect(placedOrder.isPlaced).toBeTruthy()
    })
  })

  describe('difference', () => {
    it('should discern if orders related (primary requirement for computing the diff)', () => {
      expect(order.isRelatedTo(Order.ask(amount, price, currencies))).toBeTruthy()
      expect(order.isRelatedTo(Order.ask(amount - 1, price, currencies))).toBeTruthy()
      expect(order.isRelatedTo(Order.ask(amount, price, Currency.pair(Currency.LEV(), Currency.ETH())))).toBeTruthy()

      expect(order.isRelatedTo(Order.ask(amount, price, Currency.pair(new Currency('whatever'), Currency.ETH())))).toBeFalsy()
      expect(order.isRelatedTo(Order.ask(amount, price, Currency.pair(Currency.LEV(), new Currency('whatever'))))).toBeFalsy()
      expect(order.isRelatedTo(Order.ask(amount, price + 1.00, currencies))).toBeFalsy()
      expect(order.isRelatedTo(Order.bid(amount, price, currencies))).toBeFalsy()
    })

    it('compute the difference from a related order', () => {
      expect(order.deduct(Order.ask(amount, price, currencies)).amount).toEqual(0)

      const delta = 2
      const difference = order.deduct(Order.ask(amount - delta, price, currencies))
      expect(difference.way).toBe(order.way)
      expect(difference.price).toBe(order.price)
      expect(difference.amount).toBe(delta)
    })

    it('should throw if orders cannot be diffed', () => {
      expect(() => { order.deduct(Order.ask(amount, price + 1.00, currencies)) }).toThrow(/to compute a difference, orders must have same id, way, price, and currencies/)
      expect(() => { order.deduct(Order.bid(amount, price, currencies)) }).toThrow(/to compute a difference, orders must have same id, way, price, and currencies/)
      expect(() => { order.deduct(Order.ask((amount * 2) + 1, price, currencies)) }).toThrow('deducted amount 21 cannot be greater then 10')
    })
  })

})
