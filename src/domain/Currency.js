import {Map} from 'immutable'
import ImmutableObject from './ImmutableObject'


export default class Currency extends ImmutableObject {
  static from(symbol) { return new Currency(Map({symbol: symbol})) }
  static LEV() { return Currency.from('LEV') }
  static ETH() { return Currency.from('ETH') }
  static pair(primary, secondary) { return CurrencyPair.from(primary, secondary) }

  constructor(map) { super(map) }
  get symbol() { return this.get('symbol') }
  toString() { return this.symbol }
}


class CurrencyPair extends ImmutableObject {
  static from(primary, secondary) { return new CurrencyPair(Map({primary: primary.map, secondary: secondary.map})) }

  constructor(map) { super(map) }
  get primary() { return this.get('primary') }
  get secondary() { return this.get('secondary') }
  get code() { return `${this.primary}${this.secondary}` }
  toString() { return `${this.primary}<->${this.secondary}` }
}


