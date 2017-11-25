import {Map} from 'immutable'
import ImmutableObject from '../common/ImmutableObject'


/** I represent an ERC20 token, a Crypto-currency or a Fiat currency */
export default class Currency extends ImmutableObject {
  static of(symbol) { return new Currency(Map({symbol: symbol})) }
  static LEV() { return Currency.of('LEV') }
  static ETH() { return Currency.of('ETH') }
  static pair(primary, secondary) { return CurrencyPair.of(primary, secondary) }

  constructor(map) { super(map) }
  get symbol() { return this.get('symbol') }
  toString() { return this.symbol }
}


/** I represent the notion of a primary currency traded in term of a secondary currency */
class CurrencyPair extends ImmutableObject {
  static of(primary, secondary) {
    return new CurrencyPair(Map({
      primary: primary.map,
      secondary: secondary.map,
      code: `${primary.symbol}${secondary.symbol}`,
    })
  )}

  constructor(map) { super(map) }
  get primary() { return this.get('primary') }
  get secondary() { return this.get('secondary') }
  get code() { return this.get('code') }
  toString() { return this.code }
}


