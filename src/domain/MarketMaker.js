import queue from 'queue'
import fs from 'fs'
import mkdirp from 'mkdirp'
import {List} from 'immutable'
import {exceptionHandler} from '../common/globals'
import {getLogger} from '../common/logging'
import {Lists} from '../common/van_diagrams'
import CurrencyPair from './CurrencyPair'
import Order from './Order'
import SpreadStrategy from './SpreadStrategy'
import OrderBook from './OrderBook'


/**
 * I maintain a spread of ask & bid order to keep the market "happening" in an exchange.
 * as trading events happen, I adjust positions in a given book using a spread strategy.
 */
export default class MarketMaker {
  static fromConfig(exchange, config) {
    const currencies = CurrencyPair.fromConfig(config.currencies)
    const strategy = SpreadStrategy.fromConfig(config.spread)
    const trades = JobQueue.fromConfig(config.trades)
    const saveChanges = config.save_changes
    return this.of(exchange, strategy, currencies, trades, saveChanges)
  }

  static of(exchange, strategy, currencies, trades, saveChanges = false) {
    return new MarketMaker(exchange, strategy, currencies, trades, saveChanges)
  }

  constructor(exchange, strategy, currencies, trades, saveChanges) {
    this.exchange = exchange
    this.strategy = strategy
    this.currencies = currencies
    this.trades = trades
    this.saveChanges = saveChanges
    /** starting with an empty book, we need to synchronize with the exchange */
    this.book = OrderBook.of(currencies)
  }

  /** synchronize with exchange's current positions.
   * this is needed whenever a MarketMaker comes alive.
   */
  async synchronize() {
    //fixme: how do we distinguish between 'our' orders and others? (validate that we only get ours from the exchange)

    this.trades.stop() // stop processing trades while we update the book
    this.exchange.subscribe(this.currencies, this.respondTo) //fixme: need to unsubscribe first?

    /* establish a book from the exchange */
    const ordersFromExchange = await this.exchange.getCurrentOrdersFor(this.currencies)
    const bookFromExchange = OrderBook.of(this.currencies, ordersFromExchange)

    /* now get the latest exchange rate and re-spread accordingly */
    const result = this._respread_(this._store_(bookFromExchange))
    this.trades.start() // now resume processing trades
    return result
  }

  /** on notification of a trade (for existing orders):
   * 1. merge the book with the newly traded order
   * 2. if the orders are filled, re-spread the book by applying the spread strategy to it
   */
  async respondTo_new(trade) {
    const job = () => new Promise(resolve => {
      const orders = this.book.ordersApplicableTo(trade)
      if (orders.isEmpty()) Promise.resolve(this.book)
      else {
        const modified = Promise.all(orders.map(each => this.exchange.getOrder(each.id))) //fixme: how to await here?
        const anyFulfilled = modified.exists(each => each.isFulfilled)
        Promise.resolve(modified.reduce((book, each) => book.offset(each), this.book)).
          then(book => anyFulfilled ? this._respread_(book) : book).
          then(book => this._store_(book))
      }
      resolve()
    })
    this.trades.push(job)
  }

  async respondTo(order) {
    return this.respondTo_older(order)
  }

  async respondTo_older(order) {
    const job = () => new Promise(resolve => {
      if (this.book.hasOrder(order.id)) {
        const currentOrder = this.book.getOrder(order.id)
        if (currentOrder.isRelatedTo(order)) {
          Promise.resolve(this.book.offset(order)).
            then(book => order.isFulfilled ? this._respread_(book) : book).
            then(book => this._store_(book))
        } else Promise.resolve(this.book)
      } else Promise.resolve(this.book)
      resolve()
    })
    this.trades.push(job)
  }

  /**
   * recalibrating the book logic:
   *  1. compute new positions given spread strategy & last traded price
   *  2. from current & future positions, compute a van diagram of: to-cancel | to-keep | to-place positions
   *  3. place all to-place  positions
   *  4. cancel all to-cancel positions
   *  5. move the book to future positions using { kept & placed }
   */
  async _respread_(book) {
    const price = await this.exchange.getLastExchangeRateFor(this.currencies)
    const current = book.orders
    const future = this.strategy.applyTo(price, this.currencies)
    const {toCancel, toKeep, toPlace} = groupByCancelKeepPlace(current, future)

    // to guarantee there are always orders in the exchange. therefore:
    // place new toPlace orders first, and only then cancel toCancel orders
    const placed = await Promise.all(toPlace.map(each => this.exchange.place(each)))
    const cancelled = await Promise.all(toCancel.map(each => this.exchange.cancel(each)))
    if (!cancelled.reduce((success, each) => success && each, true)) {
      //fixme: what should we do instead?
      log.warn('failed to cancel at least one of %s', toCancel.join('\n'))
    }
    return this._store_(OrderBook.of(this.currencies, toKeep.merge(placed)))
  }

  _store_(book) {
    this.book = book
    if (this.saveChanges) {
      const dir = `data/markets/${this.exchange.name}/${book.currencies.code}`
      storeInFile(book, dir)
    }
    return book
  }

}


const log = getLogger('MarketMaker')

const storeInFile = (book, dir) => { //fixme: test this
  const filename = new Date().toISOString()
  const path = `${dir}/${filename}`
  mkdirp(dir, (e) => {
    if (e) exceptionHandler(e)
    const contents = book.orders.map((v, k) => v.toLongString()).join('\n')
    fs.writeFile(path, contents, (e) => { if (e) exceptionHandler(e) })
  })
  return book
}

export const groupByCancelKeepPlace = (currentOrders, futureOrders) => {
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

const JobQueue = {
  fromConfig: (config) => {
    const {capacity, timeout} = config
    const q = queue({limit: capacity, timeout: timeout, autostart: true})
    q.on('success', (result, job) => log.debug('finished processing: %s', jobToString(job)))
    q.on('error', (e, job) => { log.error('encountered a problem with: %s', jobToString(job), e); throw e })
    q.on('timeout', (next, job) => { log.error('job timed out: %s', jobToString(job)); next() })
//    q.on('end', (errors) => log.debug(`DONE :-${errors ? '(' : ')'}`)) //fixme: to be or not to be DONE?
    return q
  }
}
const jobToString = (job) => job.toString().replace(/\n/g, '')
