import {Map} from 'immutable'
import ImmutableObject from '../common/ImmutableObject'
import Currency from './Currency'


/** I represent the notion of a primary currency traded in term of a secondary currency */
export default class CurrencyPair extends ImmutableObject {
  static get(code) { return pairs.get(code) }
  static has(code) { return pairs.has(code) }

  static of(primarySymbol, secondarySymbol) {
    const primary = Currency.of(primarySymbol), secondary = Currency.of(secondarySymbol)
    const code = `${primary.symbol}${secondary.symbol}`
    if (!pairs.has(code)) pairs.set(code, new CurrencyPair(Map({
      primary: primary.symbol,
      secondary: secondary.symbol,
      code: code,
    })))
    return this.get(code)
  }
  static fromConfig(config) { return this.of(Currency.of(config.primary), Currency.of(config.secondary)) }

  constructor(map) { super(map) }
  get primary() { return Currency.of(this.get('primary')) }
  get secondary() { return Currency.of(this.get('secondary')) }
  get code() { return this.get('code') }
  toString() { return `${this.primary.symbol}->${this.secondary.symbol}` }

  contains(symbol) { return this.primary.symbol === symbol || this.secondary.symbol === symbol }
}
/* private storage for memoized pairs */
const pairs = Map().asMutable()


