import * as fixtures from '../common/test_helpers/fixtures'
import Order from './Order'
import Currency from './Currency'


describe('Order', () => {
  const currencies = fixtures.currencies
  const quantity = 10, price = 10.50
  const order = Order.ask(quantity, price, currencies)

  describe('construction', () => {
    it('a new order has no id, and therefore is not placed yet', () => {
      expect(order.id).toBeUndefined()
      expect(order.timestamp).toBeUndefined()
      expect(order.isAsk).toBe(true)
      expect(order.isBid).toBe(false)
      expect(order.isPlaced).toBe(false)
      expect(order.toJS()).toEqual({
        id: undefined,
        timestamp: undefined,
        side: 'Ask',
        quantity: 10,
        remaining: 10,
        price: 10.5,
        currencies: {
          primary: {symbol: 'LEV'},
          secondary: {symbol: 'ETH'},
          code: 'LEVETH'
        }
      })
    })

    it('placed order criteria', () => {
      expect(order.quantity).toBe(10)

      const placed = order.placeWith('id_1')
      expect(placed.id).toBeDefined()
      expect(placed.timestamp).toBeTruthy()
      expect(placed.isPlaced).toBe(true)
      expect(placed.isNew).toBe(true)
      expect(placed.isPartial).toBe(false)
      expect(placed.isFulfilled).toBe(false)

      const partial = placed._less_(1)
      expect(partial.id).toBeDefined()
      expect(partial.timestamp).toBeDefined()
      expect(partial.isPlaced).toBe(true)
      expect(partial.isNew).toBe(false)
      expect(partial.isPartial).toBe(true)
      expect(partial.isFulfilled).toBe(false)

      const fulfilled = placed._less_(order.quantity)
      expect(fulfilled.id).toBeDefined()
      expect(fulfilled.timestamp).toBeDefined()
      expect(fulfilled.isPlaced).toBe(true)
      expect(fulfilled.isNew).toBe(false)
      expect(fulfilled.isPartial).toBe(false)
      expect(fulfilled.isFulfilled).toBe(true)
    })

    it('an order should have valid quantity & price', () => {
      expect(() => { Order.ask(0, price, currencies) }).toThrow(/quantity must be positive/)
      expect(() => { Order.ask(-1, price, currencies) }).toThrow(/quantity must be positive/)
      expect(() => { Order.ask(quantity, -1 * price, currencies) }).toThrow(/price must be positive/)
    })

    it('an order is placed by assigning id', () => {
      const placedOrder = order.placeWith('test-id')
      expect(order.isPlaced).toBe(false)
      expect(placedOrder.isPlaced).toBe(true)
    })
  })

  describe('isRelatedTo', () => {
    it('should discern if orders are related (primary requirement when filling an order)', () => {
      expect(order.isRelatedTo(order.placeWith(order.id, new Date()))).toBe(true)
      expect(order.isRelatedTo(order._less_(1))).toBe(true)
      expect(order.isRelatedTo(Order.ask(quantity, price, fixtures.currencies))).toBe(true)

      expect(order.isRelatedTo(order.placeWith('whatever-id', order.timestamp))).toBe(false)
      expect(order.isRelatedTo(Order.ask(quantity - 1, price, currencies))).toBe(false)
      expect(order.isRelatedTo(Order.ask(quantity, price, Currency.pair('whatever', 'ETH')))).toBe(false)
      expect(order.isRelatedTo(Order.ask(quantity, price, Currency.pair('LEV', 'whatever')))).toBe(false)
      expect(order.isRelatedTo(Order.ask(quantity, price + 1.00, currencies))).toBe(false)
      expect(order.isRelatedTo(Order.bid(quantity, price, currencies))).toBe(false)
    })
  })

})
