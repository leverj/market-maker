import assert from 'assert'


export default class Order {
  static ask(amount, price, currencies) { return new Order(Way.ask, amount, price, currencies) }
  static bid(amount, price, currencies) { return new Order(Way.bid, amount, price, currencies) }

  constructor(way, amount, price, currencies, id='') {
    assert(amount >= 0, `${amount} : amount must be non-negative`)
    assert(price > 0, `${price} : price must be positive`)
    this._id = id
    this._way = way
    this._amount = amount
    this._price = price
    this._currencies = currencies
  }

  get id() { return this._id }
  get way() { return this._way }
  get amount() { return this._amount }
  get price() { return this._price}
  get currencies() { return this._currencies }
  get isPlaced() { return !!this.id }

  toString() { return `[${this.id}] ${this.way} : ${this.amount} ${this.currencies.primary} @ ${this.price} ${this.currencies.secondary}` }
  placeWithId(id) { return new Order(this.way, this.amount, this.price, this.currencies, id) }

  isRelatedTo(that) {
    return (
      this.id == that.id &&
      this.way == that.way &&
      this.price == that.price &&
      this.currencies.code == that.currencies.code
    )
  }

  deduct(that) {
    assert(this.isRelatedTo(that), `to compute a difference, orders must have same id, way, price, and currencies \n\t${this}\n\t${that}`)
    assert(this.amount >= that.amount, `deducted amount ${that.amount} cannot be greater then ${this.amount}`)
    return new Order(this.way, this.amount-that.amount, this.price, this.currencies, this.id)
  }
}

export const Way = {ask: 'Ask', bid: 'Bid'}
