import * as fixtures from '../helpers/test_fixtures'
import OrderBook from './OrderBook'
import Order from './Order'
import {List, Range} from 'immutable'


describe('OrderBook', () => {
  const currencies = fixtures.defaultCurrencyPair
  const amount = 10, price = 10
  const orders = List.of(
    Order.ask(amount, price + 5, currencies),
    Order.ask(amount, price + 1, currencies),
    Order.bid(amount, price - 1, currencies),
    Order.bid(amount, price - 5, currencies),
  ).toMap()

  describe.skip('construction', () => {
    it('a new order has no id, and therefore is not placed yet', () => {
      expect(order.id).toBe('')
      expect(order.isPlaced).toBe(false)
    })

    it('an order is placed by assigning id', () => {
      const order = new Order()
      const placedOrder = order.placeWithId('test-id')
      expect(order.isPlaced).toBe(false)
      expect(placedOrder.isPlaced).toBe(false)
    })

  })
  // describe('difference', () => {
  //   it('should discern if orders related (primary requirement for computing the diff)', () => {
  //     expect(order.isRelatedTo(Order.ask(amount, price, currencies))).toBeTruthy()
  //     expect(order.isRelatedTo(Order.ask(amount - 1, price, currencies))).toBeTruthy()
  //     expect(order.isRelatedTo(Order.ask(amount, price, Currency.pair(Currency.LEV(), Currency.ETH())))).toBeTruthy()
  //
  //     expect(order.isRelatedTo(Order.ask(amount, price, Currency.pair(new Currency('whatever'), Currency.ETH())))).toBeFalsy()
  //     expect(order.isRelatedTo(Order.ask(amount, price, Currency.pair(Currency.LEV(), new Currency('whatever'))))).toBeFalsy()
  //     expect(order.isRelatedTo(Order.ask(amount, price + 1.00, currencies))).toBeFalsy()
  //     expect(order.isRelatedTo(Order.bid(amount, price, currencies))).toBeFalsy()
  //   })
  //
  //   it('compute the difference from a related order', () => {
  //     expect(order.deduct(Order.ask(amount, price, currencies)).amount).toEqual(0)
  //
  //     const delta = 2
  //     const difference = order.deduct(Order.ask(amount - delta, price, currencies))
  //     expect(difference.way).toBe(order.way)
  //     expect(difference.price).toBe(order.price)
  //     expect(difference.amount).toBe(delta)
  //   })
  //
  // })

})
