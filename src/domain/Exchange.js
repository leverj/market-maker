
export class Exchange {
  place(order) { throw new TypeError("Must override method") }
  cancel(order) { throw new TypeError("Must override method") }
  currentExchangeRateFor(currencies) { throw new TypeError("Must override method") }
}


export class MarketMaker {
  constructor(strategy, book) {
    this._strategy = strategy
    this._book = book
  }

  get book() { return this._book }
  get strategy() { return this._strategy }

  onTrade(order) {
  }
}


export class OrderBook {
  constructor(currencies, orders) {
    this._currencies = currencies
    this._orders = orders
  }

  get currencies() { return this._currencies }
  get orders() { return this._orders }
  get bids() { return this.orders.filter(each => each.way == Way.bid) }
  get asks() { return this.orders.filter(each => each.way == Way.ask) }

  toString() { return `[${this.currencies} OrderBook] : ${this.orders.size}` }
}

