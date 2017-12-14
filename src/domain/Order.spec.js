import Order from './Order'
import CurrencyPair from './CurrencyPair'


describe('Order', () => {
  const currencies = CurrencyPair.of('LEV', 'ETH')
  const quantity = 10, price = 10.50
  const order = Order.ask(quantity, price, currencies)

  describe('construction', () => {
    it('a new order has no id, and therefore is not placed yet', () => {
      expect(order.id).toBeUndefined()
      expect(order.timestamp).toBeUndefined()
      expect(order.toJS()).toEqual({
        id: undefined,
        timestamp: undefined,
        side: 'Ask',
        quantity: 10,
        remaining: 10,
        price: 10.5,
        currencies: 'LEVETH'
      })
    })

    it('an order has valid quantity & price', () => {
      expect(() => Order.ask(0, price, currencies)).toThrow(/quantity must be positive/)
      expect(() => Order.ask(-1, price, currencies)).toThrow(/quantity must be positive/)
      expect(() => Order.ask(quantity, -1 * price, currencies)).toThrow(/price must be positive/)
    })
  })

  describe('getters & queries', () => {
    it('getters', () => {
      expect(order.currencies.code).toBe('LEVETH')
      expect(order.toString()).toBe('Ask 10 LEV @ 10.5 ETH (10 remaining)')
      expect(order.toLongString()).toMatch(/undefined : undefined/)
    })
    it('queries', () => {
      expect(order.isAsk).toBe(true)
      expect(order.isBid).toBe(false)

      expect(order.isPlaced).toBe(false)

      expect(order.isNew).toBe(true)
      expect(order.isFilling).toBe(false)
      expect(order.isFilled).toBe(false)
    })
  })

  describe('order placement', () => {
    it('placed order criteria', () => {
      expect(order.quantity).toBe(10)

      const placed = order.placeWith('id_1')
      expect(placed.id).toBeDefined()
      expect(placed.timestamp).toBeTruthy()
      expect(placed.isPlaced).toBe(true)
      expect(placed.isNew).toBe(true)
      expect(placed.isFilling).toBe(false)
      expect(placed.isFilled).toBe(false)

      const partial = placed.less(1)
      expect(partial.id).toBeDefined()
      expect(partial.timestamp).toBeDefined()
      expect(partial.isPlaced).toBe(true)
      expect(partial.isNew).toBe(false)
      expect(partial.isFilling).toBe(true)
      expect(partial.isFilled).toBe(false)

      const fulfilled = placed.less(order.quantity)
      expect(fulfilled.id).toBeDefined()
      expect(fulfilled.timestamp).toBeDefined()
      expect(fulfilled.isPlaced).toBe(true)
      expect(fulfilled.isNew).toBe(false)
      expect(fulfilled.isFilling).toBe(false)
      expect(fulfilled.isFilled).toBe(true)
    })

    it('an order is placed by assigning id', () => {
      const placedOrder = order.placeWith('test-id')
      expect(order.isPlaced).toBe(false)
      expect(placedOrder.isPlaced).toBe(true)
      expect(placedOrder.toLongString()).toMatch(/\[test-id : /)
    })
  })

  describe('isRelatedTo', () => {
    it('discern if orders are related (primary requirement when filling an order)', () => {
      expect(order.isRelatedTo(order.placeWith(order.id, new Date()))).toBe(true)
      expect(order.isRelatedTo(order.less(1))).toBe(true)
      expect(order.isRelatedTo(Order.ask(quantity, price, currencies))).toBe(true)

      expect(order.isRelatedTo(order.placeWith('whatever-id', order.timestamp))).toBe(false)
      expect(order.isRelatedTo(Order.ask(quantity - 1, price, currencies))).toBe(false)
      expect(order.isRelatedTo(Order.ask(quantity, price, CurrencyPair.of('whatever', 'ETH')))).toBe(false)
      expect(order.isRelatedTo(Order.ask(quantity, price, CurrencyPair.of('LEV', 'whatever')))).toBe(false)
      expect(order.isRelatedTo(Order.ask(quantity, price + 1.00, currencies))).toBe(false)
      expect(order.isRelatedTo(Order.bid(quantity, price, currencies))).toBe(false)
    })
  })

})
