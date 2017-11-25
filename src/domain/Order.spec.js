import {lev2eth} from '../helpers/testing/fixtures'
import Order from './Order'
import Currency from './Currency'


describe('Order', () => {
  const currencies = lev2eth
  const quantity = 10, price = 10.50
  const order = Order.ask(quantity, price, currencies)

  describe('construction', () => {
    it('a new order has no id, and therefore is not placed yet', () => {
      expect(order.id).toBeUndefined()
      expect(order.timeStamp).toBeUndefined()
      expect(order.isAsk)
      expect(!order.isBid)
      expect(!order.isPlaced)
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

    it('an order should have valid quantity & price', () => {
      expect(() => { Order.ask(0, price, currencies) }).toThrow(/quantity must be positive/)
      expect(() => { Order.ask(-1, price, currencies) }).toThrow(/quantity must be positive/)
      expect(() => { Order.ask(quantity, -1 * price, currencies) }).toThrow(/price must be positive/)
    })

    it('an order is placed by assigning id', () => {
      const placedOrder = order.placeWith('test-id')
      expect(!order.isPlaced)
      expect(placedOrder.isPlaced)
    })
  })

  describe('isRelatedTo', () => {
    it('should discern if orders are related (primary requirement when filling an order)', () => {
      expect(order.isRelatedTo(Order.ask(quantity, price, currencies)))
      expect(order.isRelatedTo(Order.ask(quantity - 1, price, currencies)))
      expect(order.isRelatedTo(Order.ask(quantity, price, Currency.pair(Currency.LEV(), Currency.ETH()))))

      expect(!order.isRelatedTo(Order.ask(quantity, price, Currency.pair(Currency.of('whatever'), Currency.ETH()))))
      expect(!order.isRelatedTo(Order.ask(quantity, price, Currency.pair(Currency.LEV(), Currency.of('whatever')))))
      expect(!order.isRelatedTo(Order.ask(quantity, price + 1.00, currencies)))
      expect(!order.isRelatedTo(Order.bid(quantity, price, currencies)))
    })
  })

})
