import {lev2eth} from '../helpers/test_fixtures'
import {List} from 'immutable'
import OrderBook from './OrderBook'
import Order from './Order'


describe('OrderBook', () => {

  const currencies = lev2eth
  const amount = 10, price = 110.0
  const orders = List.of(
    Order.ask(amount, price + 5, currencies, 'id_1'),
    Order.ask(amount, price + 1, currencies, 'id_2'),
    Order.bid(amount, price - 1, currencies, 'id_3'),
    Order.bid(amount, price - 5, currencies, 'id_4'),
  )
  const book = OrderBook.from(currencies, orders)

  describe('construction', () => {
    it('orders are represented as Map of Maps', () => {
      expect(book.toJS()).toEqual(      {
        currencies: { primary: { symbol: 'LEV' }, secondary: { symbol: 'ETH' }, code: 'LEVETH' },
        orders: {
          'id_1': {
            id: 'id_1',
            way: 'Ask',
            amount: 10,
            price: 115,
            currencies: { primary: { symbol: 'LEV' }, secondary: { symbol: 'ETH' }, code: 'LEVETH' },
          },
          'id_2': {
            id: 'id_2',
            way: 'Ask',
            amount: 10,
            price: 111,
            currencies: { primary: { symbol: 'LEV' }, secondary: { symbol: 'ETH' }, code: 'LEVETH' },
          },
          'id_3': {
            id: 'id_3',
            way: 'Bid',
            amount: 10,
            price: 109,
            currencies: { primary: { symbol: 'LEV' }, secondary: { symbol: 'ETH' }, code: 'LEVETH' },
          },
          'id_4': {
            id: 'id_4',
            way: 'Bid',
            amount: 10,
            price: 105,
            currencies: {primary: {symbol: 'LEV'}, secondary: {symbol: 'ETH'}, code: 'LEVETH'},
          }
        }
      })
    })

    it('a book can contain only placed orders', () => {
      expect(book.size).toBe(orders.size)
      orders.forEach(each => expect(book.hasOrder(each.id)))

      expect(() => { OrderBook.from(currencies, orders.push(Order.ask(amount, price, currencies))) }).
        toThrow(/orders within a book must first be placed \(have an id\)/)
    })
  })

  describe('(private) order calculus', () => {
    it('can add an order', () => {
      const toBeAdded = Order.ask(amount, price, currencies).placeWithId('id_new')
      expect(!book.hasOrder(toBeAdded.id))

      const modifiedBook = book._add(toBeAdded)
      expect(modifiedBook.getOrder('id_new')).toEqual(toBeAdded)
      expect(modifiedBook.size).toBe(book.size + 1)
    })

    it('can remove an order', () => {
      const toBeDeleted = book.getOrder('id_1')
      expect(book.hasOrder(toBeDeleted.id))
      
      const modifiedBook = book._delete(toBeDeleted)
      expect(!modifiedBook.hasOrder(toBeDeleted.id))
      expect(modifiedBook.size).toBe(book.size - 1)
    })

    it('can update an order', () => {
      const toBeUpdated = book.getOrder('id_1')
      expect(book.hasOrder(toBeUpdated.id))

      const updated = toBeUpdated.plus(99)
      expect(updated.amount).toBe(toBeUpdated.amount + 99)

      const modifiedBook = book._update(updated)
      expect(modifiedBook.hasOrder(toBeUpdated.id))
      expect(modifiedBook.getOrder(toBeUpdated.id).amount).toBe(updated.amount)
      expect(modifiedBook.size).toBe(book.size)
    })
  })

  describe('offset', () => {
    it('should throw if an order cannot be offset', () => {
      expect(() => { book.offset(Order.ask(amount, price, currencies)) }).
        toThrow(/can only offset a placed order/)
      expect(() => { book.offset(Order.ask(amount, price, currencies, 'no-such-id')) }).
        toThrow(/can only offset an existing order/)
      expect(() => { book.offset(Order.ask(amount, price, currencies, 'id_1')) }).
        toThrow(/to compute a difference, orders must have same id, way, price, and currencies/)
      expect(() => { book.offset(Order.bid(amount, price + 5, currencies, 'id_1')) }).
        toThrow(/to compute a difference, orders must have same id, way, price, and currencies/)
      expect(() => { book.offset(Order.ask(amount + 1, price + 5, currencies, 'id_1')) }).
        toThrow(/deducted amount 11 cannot be greater then 10/)
    })

    it('should deduct and maintain an order if amount is smaller then existing order', () => {
      const orderId = 'id_1'
      const toOffset = book.getOrder(orderId).minus(1)
      const deducted = book.offset(toOffset)
      expect(deducted.size).toBe(book.size)
      expect(deducted.hasOrder(orderId))
      expect(deducted.getOrder(orderId).amount).toBe(1)
    })

    it('should deduct and eliminate an order if amount is equal then existing order', () => {
      const orderId = 'id_1'
      const toOffset = book.getOrder(orderId)
      const deducted = book.offset(toOffset)
      expect(deducted.size).toBe(book.size - 1)
      expect(!deducted.hasOrder(orderId))
    })
  })

})
