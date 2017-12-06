import {print} from '../common/globals'
import {GatecoinPubNubSubscriber} from './GatecoinPubNubSubscriber'
import CurrencyPair from '../domain/CurrencyPair'
import Order, {Side} from '../domain/Order'


describe('GatecoinPubNubSubscriber', () => {
  const currencies = CurrencyPair.of('LEV', 'ETH')
  const now = new Date()

  describe('tradeFrom(message) - converting from PubNub order message (json) to Order', () => {
    it('converting valid message', () => {
      const order = GatecoinPubNubSubscriber.tradeFrom(buildOrderMessage({
        id: 'id-1234567890',
        timestamp: now.getTime(),
        code: currencies.code,
        side: 0,
        price: 100.5,
        quantity: 9,
        remaining: 7,
      }))
      expect(order.id).toBe('id-1234567890')
      expect(order.timestamp).toEqual(now)
      expect(order.currenciesCode).toBe('LEVETH')
      expect(order.side).toBe(Side.ask)
      expect(order.price).toBe(100.5)
      expect(order.quantity).toBe(9)
      expect(order.remaining).toBe(7)
    })

    it('converting message with non-existing currency-pair >>> ignore it', () => {
      expect(GatecoinPubNubSubscriber.tradeFrom(buildOrderMessage({
        id: 'id-1234567890',
        timestamp: now.getTime(),
        code: 'NOCODE',
        side: 0,
        price: 100.5,
        quantity: 9,
        remaining: 7,
      }))).toBeNull()
    })

    it('remaining == quantity >>> ignore it', () => {
      expect(GatecoinPubNubSubscriber.tradeFrom(buildOrderMessage({
        id: 'id-1234567890',
        timestamp: now.getTime(),
        code: currencies.code,
        side: 0,
        price: 100.5,
        quantity: 9,
        remaining: 9,
      }))).toBeNull()
    })

    it('converting message with semantically invalid values >>> ignore it', () => {
      expect(GatecoinPubNubSubscriber.tradeFrom(buildOrderMessage({
        id: 'id-1234567890',
        timestamp: now.getTime(),
        code: currencies.code,
        side: 0,
        price: 100.5,
        quantity: 7,
        remaining: 9,
      }))).toBeNull()
    })
  })

  describe.skip('subscription', () => {
    //fixme: write the tests
    describe('verifyConnection', () => {
      it('xxx', () => {
        expect(true).toBe(true)
      })
    })
  })

})

const buildOrderMessage = (params) => {
  const {id, timestamp, code, side, price, quantity, remaining} = params
  return `{
    "order": {
      "oid": "${id}",
      "code": "${code}",
      "side": ${side},
      "price": ${price},
      "initAmount": ${quantity},
      "remainAmout": ${remaining},
      "status": 1
    },
    "channel": "order.${code}",
    "channelName": "order.${code}",
    "currency": "${code.slice(3, 6)}",
    "item": "${code.slice(0, 3)}",
    "stamp": ${timestamp}
  }`
}
