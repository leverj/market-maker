import {Map} from 'immutable'
import ImmutableObject from '../common/ImmutableObject'
import CurrencyPair from "./CurrencyPair"


export default class Trade extends ImmutableObject {
  static of(ask, bid, direction, quantity, price, currencies, id, timestamp) {
    return new Trade(Map({
      ask: ask,
      bid: bid,
      direction: direction,
      quantity: quantity,
      price: price,
      currencies: currencies.code,
      id: id,
      timestamp: timestamp
    }))
  }

  constructor(map) { super(map) }
  get ask() { return this.get('ask') }
  get bid() { return this.get('bid') }
  get direction() { return this.get('direction') }
  get quantity() { return this.get('quantity') }
  get price() { return this.get('price') }
  get currencies() { return CurrencyPair.get(this.get('currencies')) }
  get id() { return this.get('id') }
  get timestamp() { return this.get('timestamp') }
  toString() { return `ask ${this.ask} bid ${this.bid} -> ${this.direction} [${this.quantity} at ${this.price}]` }
}
