import SpreadStrategy from "./SpreadStrategy"

export class Exchange {
  place(order) { throw new TypeError("Must override method") }
  update(order) { throw new TypeError("Must override method") }
  cancel(order) { throw new TypeError("Must override method") }
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
  constructor(orders) {
    this._assets = assets
    this._orders = orders
  }

  get assets() { return this._assets }
  get orders() { return this._orders }

  toString() { return `[${this.assets} OrderBook] : ${this.orders.size}` }

  buys() { return this.orders.filter(each => each.side == Side.buy) }
  sells() { return this.orders.filter(each => each.side == Side.sell) }
}

