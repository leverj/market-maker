

export const Side = {buy: "BUY", sell: "SELL"}

export class Order {
  static buy(quantity, price, assets) { return new Order(Side.buy, quantity, price, assets) }
  static sell(quantity, price, assets) { return new Order(Side.sell, quantity, price, assets) }

  constructor(side, quantity, price, assets) {
    this._side = side
    this._quantity = quantity
    this._price = price
    this._assets = assets
  }

  get side() { return this._side }
  get quantity() { return this._quantity }
  get price() { return this._price}
  get assets() { return this._assets }

  toString() { return `[${this.side} : ${this.quantity} ${this.assets.primary} @ ${this.price} ${this.assets.secondary}]` }

  placedWith(id) { return PlacedOrder(id, this.side, this.quantity, this.price, this.assets) }
}

export class PlacedOrder extends Order {
  constructor(id, side, quantity, price, assets) {
    super(side, quantity, price, assets)
    this._id = id
  }

  get id() { return this._id }

  toString() { return `(${this.id}) ${super.toString()}` }
}
