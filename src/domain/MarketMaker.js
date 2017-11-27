import {Maps} from '../common/van_diagrams'
import {notify} from '../common/globals'
import Currency from './Currency'
import Order from './Order'
import OrderBook, {ordersToMap} from './OrderBook'
import {exceptionHandler, print} from '../common/test_helpers/utils'


/**
 * I maintain a spread of ask & bid order to keep the market "happening" in an newExchange.
 * as trading events happen, I adjust positions using a spread strategy.
 */
export default class MarketMaker {
  static of(exchange, strategy, book) {
    const currencies =  Currency.pairOf(
      book.currencies.getIn(['primary', 'symbol']),
      book.currencies.getIn(['secondary', 'symbol']))
    return new MarketMaker(exchange, strategy, currencies, book)
  }

  constructor(exchange, strategy, currencies, book) {
    this.exchange = exchange
    this.strategy = strategy
    this.currencies = currencies
    this.book = book
  }

  /** synchronizeWithExchange with newExchange's current positions.
   * this is needed whenever the MarketMaker comes alive,
   * or if orders have placed on behalf of MarketMaker by other means.
   */
  async synchronized() {
    const ordersFromExchange = await this.exchange.getCurrentOrdersFor(this.currencies)
    const bookFromExchange = OrderBook.of(this.currencies, ordersFromExchange)
          //fixme: compare local book with bookFromExchange and report discrepancies
    return MarketMaker.of(this.exchange, this.strategy, bookFromExchange)
  }

  /** on notification of a trade (of an existing order):
   * 1. offset the book with the newly traded order
   * 2. if the order is filled, recalibrate the book using the spread strategy
   */
  async respondTo(trade) {
    const existingOrder = this.book.getOrder(trade.id)
    if (!!existingOrder && existingOrder.isRelatedTo(trade)) {

      if(false) { //fixme: we might want to do the offsetting here ourselves
        const book = trade.isFulfilled ?
          this.book.remove(existingOrder) :
          this.book.merge(trade)
        return book
      }
      else { // the current method ... need to work on it ...
        this.book = this.book.offset(trade)
        if (trade.isFulfilled) await (true ? this._recalibrate_1() : this._recalibrate_2()) //fixme: which to use?
      }
    } else {
      notify(`Houston, we have a problem:\nthe trade ${trade} does not relate to any order on our book`)
    }
    return this.book
  }

  /**
  * recalibrating the book logic:
  *  1. cancel all current positions
  *  2. compute new positions given spread strategy & last traded price
  *  3. place orders for new positions
  */
  // async _recalibrate_1() {
  //   const cancelCurrentPositions = () => Promise.all(this.book.orders.map(each => this.newExchange.cancel(each)))
  //   const getLastExchangeRate = () => this.newExchange.getLastExchangeRateFor(this.currencies)
  //   const generateNewPositions = (price) => Promise.resolve(this.strategy.generateOrdersFor(price, this.currencies))
  //   const placeNewPositions = (newPositions) => Promise.all(newPositions.map(each => this.newExchange.place(each)))
  //   this.book = cancelCurrentPositions().
  //     then(cancelled => getLastExchangeRate().
  //       then(price => generateNewPositions(price)).
  //       then(newPositions => placeNewPositions(newPositions)))
  // }
  async _recalibrate_1() {
    this.book = Promise.all(this.book.orders.map(each => this.exchange.cancel(each))).
      then(cancelled => this.exchange.getLastExchangeRateFor(this.currencies)).
      then(price => {
        const newPositions = this.strategy.generateOrdersFor(price, this.currencies)
        Promise.all(newPositions.map(each => this.exchange.place(each)))}).
      then(placed => OrderBook.of(this.currencies, placed))
    return this.book
  }

  /**
   * recalibrating the book logic:
   *  1. compute new positions given spread strategy & last traded price
   *  2. from current & future positions, compute a van diagram of: to-cancel | to-keep | to-place positions
   *  3. cancel all to-cancel positions
   *  4. place all to-place  positions
   *  5. move the book to future positions (kept + placed)
   */
  async _recalibrate_2() {
    const price = await this.exchange.getLastExchangeRateFor(this.currencies)
    const current = this.book.order
    const future = this.strategy.generateOrdersFor(price, this.currencies)
    const {toCancel, toKeep, toPlace} = this.groupByCancelKeepPlace(current, future)

    const cancelled = await Promise.all(toCancel.map(each => this.exchange.cancel(each)))
    if (!cancelled.reduce((success, each) => success && each)) {
      console.log(`failed to cancel at least one of ${toCancel.join('\n')}`) //fixme: what should we do instead?
    }
    const placed = await Promise.all(toPlace.map(each => this.exchange.place(each)))
    this.book = OrderBook.of(this.currencies, toKeep.merge(placed))
  }

  groupByCancelKeepPlace(currentOrders, futureOrders) {
    const vanDiagram = Maps.vanDiagram(ordersToMap(currentOrders), ordersToMap(futureOrders)).flatMap((v,k) => new Order(v))
    return {
      toCancel: vanDiagram.leftOnly,
      toKeep: vanDiagram.intersection,
      toPlace: vanDiagram.rightOnly
    }
  }

}


