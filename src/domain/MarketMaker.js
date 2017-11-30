import fs from 'fs'
import mkdirp from 'mkdirp'
import {exceptionHandler} from '../common/globals'
import {Lists} from '../common/van_diagrams'
import Order from './Order'
import OrderBook from './OrderBook'


/**
 * I maintain a spread of ask & bid order to keep the market "happening" in an exchange.
 * as trading events happen, I adjust positions in a given book using a spread strategy.
 */
export default class MarketMaker {
  static of(exchange, strategy, currencies) {
    return new MarketMaker(exchange, strategy, currencies)
  }

  constructor(exchange, strategy, currencies) {
    this.exchange = exchange
    this.strategy = strategy
    this.currencies = currencies
    /** starting with an empty book, we need to synchronize with the exchange */
    this.book = OrderBook.of(currencies) 
  }

  get currenciesCode() { return this.currencies.get('code') }

  /** synchronize with exchange's current positions.
   * this is needed whenever the MarketMaker comes alive.
   */
  async synchronize() {
    //fixme: how do we distinguish between 'our' orders and others? (validate that we only get ours from the exchange)

    //messages.lock()
    this.exchange.subscribe(this.currencies, this.respondTo)

    /* establish a book from the exchange */
    const ordersFromExchange = await this.exchange.getCurrentOrdersFor(this.currencies)
    const bookFromExchange = OrderBook.of(this.currencies, ordersFromExchange)

    /* now get the latest exchange rate and re-spread accordingly */
    const result = this._respread_(this._store_(bookFromExchange))
    ////messages.unlock()
    return result
  }

  /** on notification of a trade (for an existing order):
   * 1. offset the book with the newly traded order
   * 2. if the order is filled, respread the book by applying the spread to it
   */
  async respondTo(trade) {
    if (this.book.hasOrder(trade.id)) {
      const currentOrder = this.book.getOrder(trade.id)
      if (currentOrder.isRelatedTo(trade)) {
        return Promise.resolve(this.book.offset(trade)).
          then(book => trade.isFulfilled ? this._respread_(book) : book).
          then(book => this._store_(book))
      } else return Promise.resolve(this.book)
    } else return Promise.resolve(this.book)
  }

  /**
   * recalibrating the book logic:
   *  1. compute new positions given spread strategy & last traded price
   *  2. from current & future positions, compute a van diagram of: to-cancel | to-keep | to-place positions
   *  3. cancel all to-cancel positions
   *  4. place all to-place  positions
   *  5. move the book to future positions (kept + placed)
   */
  async _respread_(book) {
    const price = await this.exchange.getLastExchangeRateFor(this.currencies)
    const current = book.orders
    const future = this.strategy.generateOrdersFor(price, this.currencies)
    const {toCancel, toKeep, toPlace} = groupByCancelKeepPlace(current, future)

    // to guarantee there are always orders in the exchange. therefore:
    // place new toPlace orders first, and only then cancel toCancel orders
    const placed = await Promise.all(toPlace.map(each => this.exchange.place(each)))
    const cancelled = await Promise.all(toCancel.map(each => this.exchange.cancel(each)))
    if (!cancelled.reduce((success, each) => success && each, true)) {
      console.log(`failed to cancel at least one of ${toCancel.join('\n')}`) //fixme: what should we do instead?
    }
    return this._store_(OrderBook.of(this.currencies, toKeep.merge(placed)))
  }

  _store_(book) {
    this.book = book
    this._storeInFile_(book)
    return book
  }

  _storeInFile_(book) {
    const filename = new Date().toISOString()
    const dir = `data/books/${this.currenciesCode}`
    const path = `${dir}/${filename}`
    mkdirp(dir, (e) => {
      if (e) exceptionHandler(e)
      const contents = book.orders.map((v, k) => JSON.stringify(v)).join('\n')
      fs.writeFile(path, contents, (e) => { if (e) exceptionHandler(e) })
    })
  }
}

export function groupByCancelKeepPlace(currentOrders, futureOrders) {
  const vanDiagram = Lists.vanDiagram(
    currentOrders.map(each => Order.toComparable(each)),
    futureOrders.map(each => Order.toComparable(each))
  ).transform(eachList => eachList.map(each => new Order(each.map)))
  return {
    toCancel: vanDiagram.leftOnly,
    toKeep: vanDiagram.intersection,
    toPlace: vanDiagram.rightOnly
  }
}
