import CurrencyPair from '../domain/CurrencyPair'
import {Side} from '../domain/Order'
import {tradeFrom} from './GatecoinPubNubSubscriber'


describe('GatecoinPubNubSubscriber', () => {
  const currencies = CurrencyPair.of('BTC', 'USD')
  // const currencies = CurrencyPair.of('LEV', 'ETH')
  const now = new Date()
  const quantity = 10, price = 110.0

  describe('tradeFrom(message) - converting from PubNub order message (json) to Order', () => {
    it('converting valid message', () => {
      const message = buildOrderMessage('id-1', now.getTime(), currencies.code, 0, price, quantity, quantity - 3)
      const order = tradeFrom(message)
      expect(order.id).toBe('id-1')
      expect(order.timestamp).toEqual(now)
      expect(order.currenciesCode).toBe(currencies.code)
      expect(order.side).toBe(Side.bid)
      expect(order.price).toBe(price)
      expect(order.quantity).toBe(10)
      expect(order.remaining).toBe(7)
    })

    it('converting message with non-existing currency-pair >>> ignore it', () => {
      const message = buildOrderMessage('id-1', now.getTime(), 'NOCODE', 0, price, quantity, quantity - 3)
      expect(tradeFrom(message)).toBeNull()
    })

    it('remaining == quantity >>> ignore it', () => {
      const message = buildOrderMessage('id-1', now.getTime(), currencies.code, 0, price, quantity, quantity)
      expect(tradeFrom(message)).toBeNull()
    })

    it('converting message with semantically invalid values >>> ignore it', () => {
      const message = buildOrderMessage('id-1', now.getTime(), currencies.code, 0, price, quantity - 3, quantity)
      expect(tradeFrom(message)).toBeNull()
    })
  })

})


const buildOrderMessage = (id, timestamp, code, side, price, quantity, remaining) => {
  return {
    channel: `order.${code}`,
    actualChannel: null,
    subscribedChannel: `order.${code}`,
    timetoken: timestamp,
    message: {
      order: {
        oid: id,
        code: code,
        side: 0,
        price: price,
        initAmount: quantity,
        remainAmout: remaining,
        status: 2
      },
      channel: `order.${code}`,
      channelName: `order.${code}`,
      currency: code.slice(3, 6),
      item: code.slice(0, 3),
      stamp: timestamp / 1000
    }
  }
}