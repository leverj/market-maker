import {Map} from 'immutable'
import ImmutableObject from '../common/ImmutableObject'


/** I represent an ERC20 token, a Crypto-currency or a Fiat currency */
export default class Currency extends ImmutableObject {
  static of(symbol) {
    if (!currencies.has(symbol)) currencies.set(symbol, new Currency(Map({symbol: symbol})))
    return currencies.get(symbol)
  }

  constructor(map) { super(map) }
  get symbol() { return this.get('symbol') }
  toString() { return this.symbol }
}
/* private storage for memoized currencies */
const currencies = Map().asMutable()
