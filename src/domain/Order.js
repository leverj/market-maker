

export const Way = {ask: "Ask", bid: "Bid"}

export class Order {
  static ask(amount, price, currencies) { return new Order(Way.ask, amount, price, currencies) }
  static bid(amount, price, currencies) { return new Order(Way.bid, amount, price, currencies) }

  constructor(way, amount, price, currencies) {
    this._way = way
    this._amount = amount
    this._price = price
    this._currencies = currencies
  }

  get way() { return this._way }
  get amount() { return this._amount }
  get price() { return this._price}
  get currencies() { return this._currencies }

  toString() { return `[${this.way} : ${this.amount} ${this.currencies.primary} @ ${this.price} ${this.currencies.secondary}]` }

  placedWith(id) { return PlacedOrder(id, this.way, this.amount, this.price, this.currencies) }
}

export class PlacedOrder extends Order {
  constructor(id, way, amount, price, currencies) {
    super(way, amount, price, currencies)
    this._id = id
  }

  get id() { return this._id }

  toString() { return `(${this.id}) ${super.toString()}` }
}
