
export class MarketMaker {
  constructor(strategy, book, exchange) {
    this._strategy = strategy
    this._book = book
    this._exchange = exchange
  }

  get book() { return this._book }
  set book(value) { this._book = value}

  onTrade(order) {
    const updated = this.book.offset(order)
    if (!updated.get(order.id)) { // order been filled

    }


    /**
     - offset order in book
     - price = exchange.getLastExchangeRateFor(currencies) or order.price ?
     - newSpreadOrders = strategy.generateOrdersFor(price, currencies)
     - (toCancel, existing,  toPlace) = diff (newSpreadOrders, book.orders)
     - toCancel.forEach(exchange.cancel(each))
     - toPlace.forEach(exchange.place(each))
     */
  }
}


