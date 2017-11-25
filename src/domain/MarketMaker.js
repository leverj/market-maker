import {Maps} from '../common/van_diagrams'
import Order from './Order'
import OrderBook, {ordersToMap} from './OrderBook'


/**
 * I maintain a spread of ask & bid order to keep the market "happening" i n an exchange
 * as trading events happen, I adjust positions using a spread strategy
 */
export default class MarketMaker {
  static async of(exchange, strategy, currencies) {
    const orders = await exchange.getCurrentOrdersFor(currencies)
    const book = OrderBook.of(currencies, orders)
    return new MarketMaker(exchange, strategy, book)
  }

  constructor(exchange, strategy, book) {
    this.exchange = exchange
    this.strategy = strategy
    this._book = book
  }
  get book() { return this._book }

  /** on notification of a trade (of an existing order):
   * 1. offset the book with the newly traded order
   * 2. if the order is filled, recalibrate the book using the spread strategy
   */
  async onTrade(order) {
    if (this.book.hasOrder(order.id)) {
      this._book = this.book.offset(order)
      if (order.isFulfilled) await (true ? this._recalibrate_1() : this._recalibrate_2()) //fixme: which to use?
    }
  }

  // async _recalibrate_1() {
  //   Promise.all(this.book.orders.map(each => this.exchange.cancel(each)))
  //   const price = this.exchange.getLastExchangeRateFor(this.book.currencies) //fixme: or fulfilled order.price ?
  //   const newPositions = this.strategy.generateOrdersFor(price, this.book.currencies)
  //   this._book = await Promise.all(newPositions.map(each => this.exchange.place(each))).
  //     then(placed => OrderBook.of(this.book.currencies, placed))
  // }
  /**
  * recalibrating the book logic:
  *  1. cancel all current positions
  *  2. compute new positions given spread strategy & last traded price
  *  3. place orders for new positions
  */
  async _recalibrate_1() {
    const cancelCurrentPositions = () => Promise.all(this.book.orders.map(each => this.exchange.cancel(each)))
    const getLastExchangeRate = () => this.exchange.getLastExchangeRateFor(this.book.currencies)
    const generateNewPositions = (price) => Promise.resolve(this.strategy.generateOrdersFor(price, this.book.currencies))
    const placeNewPositions = (newPositions) => Promise.all(newPositions.map(each => this.exchange.place(each)))
    this._book = await cancelCurrentPositions().
      then(cancelled => getLastExchangeRate().
        then(price => generateNewPositions(price)).
        then(newPositions => placeNewPositions(newPositions)))
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
    const price = await this.exchange.getLastExchangeRateFor(this.book.currencies)
    const current = this.book.order
    const future = this.strategy.generateOrdersFor(price, this.book.currencies)
    const {toCancel, toKeep, toPlace} = this.groupByCancelKeepPlace(current, future)

    const cancelled = await Promise.all(toCancel.map(each => this.exchange.cancel(each)))
    if (!cancelled.reduce((success, each) => success && each)) {
      console.log(`failed to cancel at least one of ${toCancel.join('\n')}`) //fixme: what should we do instead?
    }
    const placed = await Promise.all(toPlace.map(each => this.exchange.place(each)))
    this._book = OrderBook.of(this.book.currencies, toKeep.merge(placed))
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


