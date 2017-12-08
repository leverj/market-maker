import {Map} from 'immutable'
import ImmutableObject from '../common/ImmutableObject'

/*
{
  "trade": {
    "date": 1512668470,
    "tid": 55823937,
    "price": 15617.3,
    "amount": 0.00011,
    "askOrderId": "BK11533607488",
    "bidOrderId": "BK11533607477",
    "direction": "ask"
  },
  "channel": "trade.BTCUSD",
  "channelName": "trade.BTCUSD",
  "currency": "USD",
  "item": "BTC",
  "stamp": 1512668470
}

 */

export default class Trade extends ImmutableObject {
  static of(ask, bid, direction, quantity, price, currencies, id, timestamp) {
    return new Trade(Map({
      ask: ask,
      bid: bid,
      direction: direction,
      quantity: quantity,
      price: price,
      currencies: currencies.map,
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
  get currencies() { return this.get('currencies') }
  toString() { return '' }
}
