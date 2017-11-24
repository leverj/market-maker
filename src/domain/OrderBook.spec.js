import {lev2eth} from '../helpers/test_fixtures'
import {List} from 'immutable'
import OrderBook from './OrderBook'
import Order from './Order'


describe('OrderBook', () => {
  const currencies = lev2eth
  const quantity = 10, price = 110.0
  const now = new Date
  const orders = List.of(
    Order.ask(quantity, price + 5, currencies).placeWith('id_1', now),
    Order.ask(quantity, price + 1, currencies).placeWith('id_2', now),
    Order.bid(quantity, price - 1, currencies).placeWith('id_3', now),
    Order.bid(quantity, price - 5, currencies).placeWith('id_4', now),
  )
  const book = OrderBook.from(currencies, orders)

  describe('construction', () => {
    it('orders are represented as Map of Maps', () => {
      /*
       Map { "currencies": Map { "primary": Map { "symbol": "LEV" }, "secondary": Map { "symbol": "ETH" }, "code": "LEVETH" }, "orders": Map { "id_1": Map { "id": "id_1", "timestamp": Fri Nov 24 2017 02:28:09 GMT-0800 (PST), "currencies": Map { "primary": Map { "symbol": "LEV" }, "secondary": Map { "symbol": "ETH" }, "code": "LEVETH" }, "side": "Ask", "price": 115, "quantity": 10, "remaining": 10 }, "id_2": Map { "id": "id_2", "timestamp": Fri Nov 24 2017 02:28:09 GMT-0800 (PST), "currencies": Map { "primary": Map { "symbol": "LEV" }, "secondary": Map { "symbol": "ETH" }, "code": "LEVETH" }, "side": "Ask", "price": 111, "quantity": 10, "remaining": 10 }, "id_3": Map { "id": "id_3", "timestamp": Fri Nov 24 2017 02:28:09 GMT-0800 (PST), "currencies": Map { "primary": Map { "symbol": "LEV" }, "secondary": Map { "symbol": "ETH" }, "code": "LEVETH" }, "side": "Bid", "price": 109, "quantity": 10, "remaining": 10 }, "id_4": Map { "id": "id_4", "timestamp": Fri Nov 24 2017 02:28:09 GMT-0800 (PST), "currencies": Map { "primary": Map { "symbol": "LEV" }, "secondary": Map { "symbol": "ETH" }, "code": "LEVETH" }, "side": "Bid", "price": 105, "quantity": 10, "remaining": 10 } } }
       */
      expect(book.toJS()).toEqual(      {
        currencies: { primary: { symbol: 'LEV' }, secondary: { symbol: 'ETH' }, code: 'LEVETH' },
        orders: {
          'id_1': {
            id: 'id_1',
            timestamp: now,
            side: 'Ask',
            quantity: 10,
            remaining: 10,
            price: 115,
            currencies: { primary: { symbol: 'LEV' }, secondary: { symbol: 'ETH' }, code: 'LEVETH' },
          },
          'id_2': {
            id: 'id_2',
            timestamp: now,
            side: 'Ask',
            quantity: 10,
            remaining: 10,
            price: 111,
            currencies: { primary: { symbol: 'LEV' }, secondary: { symbol: 'ETH' }, code: 'LEVETH' },
          },
          'id_3': {
            id: 'id_3',
            timestamp: now,
            side: 'Bid',
            quantity: 10,
            remaining: 10,
            price: 109,
            currencies: { primary: { symbol: 'LEV' }, secondary: { symbol: 'ETH' }, code: 'LEVETH' },
          },
          'id_4': {
            id: 'id_4',
            timestamp: now,
            side: 'Bid',
            quantity: 10,
            remaining: 10,
            price: 105,
            currencies: {primary: {symbol: 'LEV'}, secondary: {symbol: 'ETH'}, code: 'LEVETH'},
          }
        }
      })
    })

    it('a book can contain only placed orders', () => {
      expect(book.size).toBe(orders.size)
      orders.forEach(each => expect(book.hasOrder(each.id)))

      expect(() => { OrderBook.from(currencies, orders.push(Order.ask(quantity, price, currencies))) }).
        toThrow(/orders within a book must first be placed \(have an id\)/)
    })
  })

  describe('(private) insert / update/ delete of orders', () => {
    it('can add an order', () => {
      const before = book
      expect(!before.hasOrder('id_new'))

      const toBeAdded = Order.ask(quantity, price, currencies).placeWith('id_new')
      const after = before.usurp(toBeAdded)
      expect(after.hasOrder('id_new'))
      expect(after.getOrder('id_new')).toEqual(toBeAdded)
      expect(after.size).toBe(before.size + 1)
    })

    it('can remove an order', () => {
      const before = book
      expect(before.hasOrder('id_1'))

      const toBeRemoved = before.getOrder('id_1')
      const after = before.remove(toBeRemoved)
      expect(!after.hasOrder('id_1'))
      expect(after.size).toBe(before.size - 1)
    })

    it('can update an order', () => {
      const before = book
      expect(before.hasOrder('id_1'))

      const toBeUpdated = decrement(before.getOrder('id_1'), 1)
      const after = before.usurp(toBeUpdated)
      expect(after.hasOrder('id_1'))
      const updated = after.getOrder('id_1')
      expect(updated.quantity).toBe(toBeUpdated.quantity)
      expect(updated.remaining).toBe(toBeUpdated.remaining)
      expect(after.size).toBe(before.size)
    })
  })

  describe('offset', () => {
    it('should throw if an order cannot be offset', () => {
      expect(() => { book.offset(Order.ask(quantity, price, currencies)) }).
        toThrow(/can only offset an existing order/)
      expect(() => { book.offset(Order.ask(quantity, price, currencies).placeWith('no-such-id')) }).
        toThrow(/can only offset an existing order/)
      expect(() => { book.offset(Order.ask(quantity, price, currencies).placeWith('id_1')) }).
        toThrow(/can only offset a related order/)
      expect(() => { book.offset(Order.bid(quantity, price + 5, currencies).placeWith('id_1')) }).
        toThrow(/can only offset a related order/)
    })

    it('should offset and maintain an order if it is not filled', () => {
      const id = 'id_1'
      const before = book
      const existing = before.getOrder(id)
      const partial = decrement(existing, 1)
      expect(!partial.isFulfilled)

      const after = before.offset(partial)
      expect(after.hasOrder(id))
      expect(after.size).toBe(before.size)
      expect(!after.getOrder(id).isFulfilled)
      expect(after.getOrder(id).remaining).toBe(9)
    })

    it('should offset and remove an order if it is filled', () => {
      const id = 'id_1'
      const before = book
      const existing = before.getOrder(id)
      const filled = decrement(existing, existing.remaining)
      expect(filled.isFulfilled)

      const after = before.offset(filled)
      expect(!after.hasOrder(id))
      expect(after.size).toBe(before.size - 1)
    })
  })

})


const decrement = (order, quantity) => new Order(order.map.merge({remaining: order.remaining - quantity}))
