import OrderBook from './OrderBook'


/**
 * I maintain a spread of ask & bid order to keep the market "happening" i n an exchange
 * as trading events happen, I adjust positions using a spread strategy
 */
export default class MarketMaker {
  static async from(exchange, strategy, currencies) {
    const orders = await exchange.getCurrentOrdersFor(currencies)
    const book = OrderBook.from(currencies, orders)
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
      if (order.isFulfilled) await this._recalibrate()
    }
  }

  /**
  * recalibrating the book logic:
  *  a. cancel all existing orders
  *  b. compute new positions based spread strategy & last traded price
  *  c. place orders for new positions
  */
  async _recalibrate() {
    Promise.all(this.book.orders.map(each => this.exchange.cancel(each)))
    const price = this.exchange.getLastExchangeRateFor(this.book.currencies) //fixme: or fulfilled order.price ?
    const newPositions = this.strategy.generateOrdersFor(price, this.book.currencies)
    this._book = await Promise.all(newPositions.map(each => this.exchange.place(each))).
      then(placed => OrderBook.from(this.book.currencies, placed))
  }

  //
  //
  // async _recalibrate2() {
  //   //fixme fixme fixme fixme fixme fixme fixme fixme fixme fixme fixme fixme
  //   const price = await this.exchange.getLastExchangeRateFor(this.book.currencies) //fixme: or fulfilled order.price ?
  //   const newOrders = this.strategy.generateOrdersFor(price, this.book.currencies)
  //   const toStay = List()  //fixme
  //   const toCancel = this.book.orders  //fixme
  //   const toPlace = newOrders  //fixme
  //   await Promise.all(toCancel.map(each => this.exchange.cancel(each)))
  //   const placed = await Promise.all(toPlace.map(each => this.exchange.place(each)))
  //   this._book = OrderBook.from(this.book.currencies, toStay + placed) //fixme
  // }

}


