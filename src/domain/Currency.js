import {Map} from 'immutable'
import ImmutableObject from '../common/ImmutableObject'


/** I represent an ERC20 token, a Crypto-currency or a Fiat currency */
export default class Currency extends ImmutableObject {
  static of(symbol) {
    if (!currencies.has(symbol)) currencies.set(symbol, new Currency(Map({symbol: symbol})))
    return currencies.get(symbol)
  }
  static pair(primarySymbol, secondarySymbol) { return CurrencyPair.of(this.of(primarySymbol), this.of(secondarySymbol)) }
  static pairWithCode(code) { return CurrencyPair.withCode(code) }

  constructor(map) { super(map) }
  get symbol() { return this.get('symbol') }
  toString() { return this.symbol }
}
/* private storage for memoized currencies */
const currencies = Map().asMutable()


/** I represent the notion of a primary currency traded in term of a secondary currency */
class CurrencyPair extends ImmutableObject {
  static of(primary, secondary) {
    const code = `${primary.symbol}${secondary.symbol}`
    if (!pairs.has(code)) pairs.set(code, new CurrencyPair(Map({
      primary: primary.map,
      secondary: secondary.map,
      code: code,
    })))
    return this.withCode(code)
  }
  static withCode(code) { return pairs.get(code) }

  constructor(map) { super(map) }
  get primary() { return this.get('primary') }
  get secondary() { return this.get('secondary') }
  get code() { return this.get('code') }
  toString() { return `${this.getIn(['primary', 'symbol'])}->${this.getIn(['secondary', 'symbol'])}` }
}
/* private storage for memoized pairs */
const pairs = Map().asMutable()


