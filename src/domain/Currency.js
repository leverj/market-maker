export default class Currency {
  static LEV() { return new Currency('LEV') }
  static ETH() { return new Currency('ETH') }

  static pair(primary, secondary) { return new CurrencyPair(primary, secondary) }

  constructor(symbol) {
    this._symbol = symbol
  }

  get symbol() { return this._symbol }

  toString() { return this.symbol }
}


class CurrencyPair {
  constructor(primary, secondary) {
    this._primary = primary
    this._secondary = secondary
  }

  get primary() { return this._primary }
  get secondary() { return this._secondary }
  get code() { return `${this.primary}${this.secondary}` }

  toString() { return `${this.primary}<->${this.secondary}` }
}


