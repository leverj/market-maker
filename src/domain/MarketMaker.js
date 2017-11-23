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
    // if (this.book.size == 0) this.recalibrate()
  }
  get book() { return this._book }
  get currencies() { return this.book.currencies }

  /** on notification of a trade (of an existing order):
   * 1. offset the book with the traded order
   * 2. if the order is fulfilled, simply:
   *  a. cancel all existing orders
   *  b. compute new positions based spread strategy & last traded price
   *  c. place orders for new positions
   */
  async onTrade(order) {
    this._book = this.book.offset(order)
    if (!this.book.hasOrder(order.id)) /* order been filled */ await this._recalibrate()
  }

  async _recalibrate2() {
    const price = await this.exchange.getLastExchangeRateFor(this.currencies) //fixme: or fulfilled order.price ?
    const newOrders = this.strategy.generateOrdersFor(price, this.currencies)
    const toStay = List()  //fixme
    const toCancel = this.book.orders  //fixme
    const toPlace = newOrders  //fixme
    await Promise.all(toCancel.map(each => this.exchange.cancel(each)))
    const placed = await Promise.all(toPlace.map(each => this.exchange.place(each)))
    this._book = OrderBook.from(this.currencies, toStay + placed) //fixme
  }
  async recalibrate() {
    Promise.all(this.book.orders.map(each => this.exchange.cancel(each)))
    const price = this.exchange.getLastExchangeRateFor(this.currencies) //fixme: or fulfilled order.price ?
    const newPositions = this.strategy.generateOrdersFor(price, this.currencies)
    this._book = await Promise.all(newPositions.map(each => this.exchange.place(each))).
      then(placed => OrderBook.from(this.currencies, placed))
  }
}


