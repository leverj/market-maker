
export class MarketMaker {
  constructor(strategy, book, exchange) {
    this._strategy = strategy
    this._book = book
    this._exchange = exchange
  }

  get book() { return this._book }

  /** on notification of a trade (of an existing order):
   * 1. offset the book with the traded order
   * 2. if the order is fulfilled,
   *  a. compute the necessary changes based on the strategy
   *  b. move the book to newly computed positions
   */
  async onTrade(order) {
    const updated = this.book.offset(order)
    if (!updated.has(order.id)) { // order been filled
      const price = exchange.getLastExchangeRateFor(currencies) //fixme: or fulfilled order.price ?
      const newSpreadOrders = strategy.generateOrdersFor(price, currencies)
      const {toBeCanceled, toRemainUnchanged, toBePlaced} = diff(book.orders, newSpreadOrders)
      const cancelled = toBeCanceled.map(await exchange.cancel(each)) //fixme: all at once
      const placed = toBePlaced.map(await exchange.place(each)) //fixme: all at once
      this._book = OrderBook.from(book.currencies, toRemainUnchanged.merge(placed))
    }
  }

  /** compute the orders that would move a book from before to after */
  diff(before, after) {
    //fixme
    return {toBeCanceled: before, toRemainUnchanged: before, toBePlaced: before}
  }
}


