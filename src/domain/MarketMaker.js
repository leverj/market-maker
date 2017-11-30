import fs from 'fs'
import mkdirp from 'mkdirp'
import {exceptionHandler} from '../common/globals'
import {Maps} from '../common/van_diagrams'
import {notify} from '../common/globals'
import Order from './Order'
import OrderBook, {ordersToMap} from './OrderBook'


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
    
    /* establish a book from the exchange */
    const ordersFromExchange = await this.exchange.getCurrentOrdersFor(this.currencies)
    const bookFromExhange = OrderBook.of(this.currencies, ordersFromExchange)

    /* now get the latest exchange rate and re-spread accordingly */
    return this._respread_(this._store_(bookFromExhange))
  }

  /** on notification of a trade (for an existing order):
   * 1. offset the book with the newly traded order
   * 2. if the order is filled, respread the book by applying the spread to it
   */
  async respondTo(trade) {
    const currentOrder = this.book.getOrder(trade.id)
    if (!currentOrder || !currentOrder.isRelatedTo(trade)) {
      notify(`Houston, we have a problem:\nthe trade ${trade} does not relate to any order in the book`)
    }

    return Promise.resolve(this.book.offset(trade)).
      then(book => trade.isFulfilled ? this._respread_(book) : book).
      then(book => this._store_(book))
  }

  /**
  * recalibrating the book logic:
  *  1. cancel all current positions
  *  2. compute new positions given spread strategy & last traded price
  *  3. place orders for new positions
  */
  async _respread_(book) {
    return Promise.all(book.orders.map(each => this.exchange.cancel(each))).
      then(cancelled => this.exchange.getLastExchangeRateFor(this.currencies)).
      then(price => Promise.all(this.strategy.generateOrdersFor(price, this.currencies).map(each => this.exchange.place(each)))).
      then(placed => OrderBook.of(this.currencies, placed))
  }

  /**
   * recalibrating the book logic:
   *  1. compute new positions given spread strategy & last traded price
   *  2. from current & future positions, compute a van diagram of: to-cancel | to-keep | to-place positions
   *  3. cancel all to-cancel positions
   *  4. place all to-place  positions
   *  5. move the book to future positions (kept + placed)
   */
  async _respread_2(book) {
    const price = await this.exchange.getLastExchangeRateFor(this.currencies)
    const current = book.order
    const future = this.strategy.generateOrdersFor(price, this.currencies)
    const {toCancel, toKeep, toPlace} = this.groupByCancelKeepPlace(current, future)

    const cancelled = await Promise.all(toCancel.map(each => this.exchange.cancel(each)))
    if (!cancelled.reduce((success, each) => success && each)) {
      console.log(`failed to cancel at least one of ${toCancel.join('\n')}`) //fixme: what should we do instead?
    }
    const placed = await Promise.all(toPlace.map(each => this.exchange.place(each)))
    return OrderBook.of(this.currencies, toKeep.merge(placed))
  }

  groupByCancelKeepPlace(currentOrders, futureOrders) {
    const vanDiagram = Maps.vanDiagram(ordersToMap(currentOrders), ordersToMap(futureOrders)).flatMap((v,k) => new Order(v))
    return {
      toCancel: vanDiagram.leftOnly,
      toKeep: vanDiagram.intersection,
      toPlace: vanDiagram.rightOnly
    }
  }

  _store_(book) {
    this.book = book
    this._storeInFile_(book)
    return book
  }

  _storeInFile_(book) {
    const filename = new Date().toISOString()
    const dir = `data/${this.currenciesCode}`
    const path = `${dir}/${filename}`
    mkdirp(dir, (e) => {
      if (e) exceptionHandler(e)
      const contents = book.orders.map((v, k) => JSON.stringify(v)).join('\n')
      fs.writeFile(path, contents, (e) => { if (e) exceptionHandler(e) })
    })
  }
}
