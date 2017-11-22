import * as fixtures from '../helpers/test_fixtures'
import OrderBook from './OrderBook'
import Order from './Order'
import {List, Map} from 'immutable'


describe('OrderBook', () => {
  const currencies = fixtures.defaultCurrencyPair
  const amount = 10, price = 110.0
  const orders = List.of(
    Order.ask(amount, price + 5, currencies, 'id-1'),
    Order.ask(amount, price + 1, currencies, 'id-2'),
    Order.bid(amount, price - 1, currencies, 'id-3'),
    Order.bid(amount, price - 5, currencies, 'id-4'),
  )
  const book = new OrderBook(currencies, toMap(orders))

  describe('construction', () => {
    it('a book can contain only placed orders', () => {
      expect(book.size).toBe(orders.size)
      orders.forEach(each => expect(book.has(each.id)).toBeTruthy())

      expect(() => { new OrderBook(currencies, toMap(orders.push(Order.ask(amount, price, currencies)))) }).
        toThrow(/orders within a book must first be placed \(have an id\)/)
    })
  })

  describe('offset', () => {
    it('should throw if an order cannot be offset', () => {
      expect(() => { book.offset(Order.ask(amount, price, currencies)) }).
        toThrow(/can offset only a placed order/)
      expect(() => { book.offset(Order.ask(amount, price, currencies, 'no-such-id')) }).
        toThrow(/can offset only an existing order/)
      expect(() => { book.offset(Order.ask(amount, price, currencies, 'id-1')) }).
        toThrow(/to compute a difference, orders must have same id, way, price, and currencies/)
      expect(() => { book.offset(Order.bid(amount, price + 5, currencies, 'id-1')) }).
        toThrow(/to compute a difference, orders must have same id, way, price, and currencies/)
      expect(() => { book.offset(Order.ask(amount + 1, price + 5, currencies, 'id-1')) }).
        toThrow(/deducted amount 11 cannot be greater then 10/)
    })

    it('should deduct and maintain an order if amount is smaller then existing order', () => {
      const orderId = 'id-1'
      const toOffset = book.get(orderId).minus(1)
      const deducted = book.offset(toOffset)
      expect(deducted.size).toBe(book.size)
      expect(deducted.has(orderId)).toBeTruthy()
      expect(deducted.get(orderId).amount).toBe(1)
    })

    it('should deduct and eliminate an order if amount is equal then existing order', () => {
      const orderId = 'id-1'
      const toOffset = book.get(orderId)
      const deducted = book.offset(toOffset)
      expect(deducted.size).toBe(book.size - 1)
      expect(deducted.has(orderId)).toBeFalsy()
    })
  })

})

function toMap(orders) { return  Map(orders.map(each => [each.id, each]))}