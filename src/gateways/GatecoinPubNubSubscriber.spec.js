import CurrencyPair from '../domain/CurrencyPair'
import {Side} from '../domain/Order'
import {tradeFrom, orderFrom} from './GatecoinPubNubSubscriber'
import Order from "../domain/Order"


describe('GatecoinPubNubSubscriber', () => {
  const currencies = CurrencyPair.of('LEV', 'ETH')
  const now = new Date()
  const quantity = 10, price = 110.0

  describe('tradeFrom(message) - converting from PubNub trade message (json) to Trade', () => {
    it('converting valid message', () => {
      const quantityTraded = quantity -1
      const ask = Order.ask(quantity, price, currencies).placeWith('id-ask-1', now)
      const bid = Order.ask(quantityTraded, price, currencies).placeWith('id-bid-1', now)
      const message = buildTradeMessage(ask.id, bid.id, 'ask', quantityTraded, price, currencies, 'id-trade-1', now.getTime())
      const trade = tradeFrom(message, currencies)
      expect(trade.ask).toBe(ask.id)
      expect(trade.bid).toBe(bid.id)
      expect(trade.direction).toBe(Side.ask)
      expect(trade.quantity).toBe(quantityTraded)
      expect(trade.price).toBe(price)
      expect(trade.currencies).toBe(currencies)
      expect(trade.id).toBe('id-trade-1')
    })
  })

  describe.skip('orderFrom(message) - converting from PubNub order message (json) to Order', () => {
    it('converting valid message', () => {
      const message = buildOrderMessage('id-1', now.getTime(), currencies.code, 0, price, quantity, quantity - 3)
      const order = orderFrom(message)
      expect(order.id).toBe('id-1')
      expect(order.timestamp).toEqual(now)
      expect(order.currencies.code).toBe(currencies.code)
      expect(order.side).toBe(Side.bid)
      expect(order.price).toBe(price)
      expect(order.quantity).toBe(10)
      expect(order.remaining).toBe(7)
    })

    it('converting message with non-existing currency-pair >>> ignore it', () => {
      const message = buildOrderMessage('id-1', now.getTime(), 'NOCODE', 0, price, quantity, quantity - 3)
      expect(orderFrom(message)).toBeNull()
    })

    it('remaining == quantity >>> ignore it', () => {
      const message = buildOrderMessage('id-1', now.getTime(), currencies.code, 0, price, quantity, quantity)
      expect(orderFrom(message)).toBeNull()
    })

    it('converting message with semantically invalid values >>> ignore it', () => {
      const message = buildOrderMessage('id-1', now.getTime(), currencies.code, 0, price, quantity - 3, quantity)
      expect(orderFrom(message)).toBeNull()
    })
  })

})

const buildTradeMessage = (ask, bid, direction, quantity, price, currencies, id, timestamp) => {
  const stamp = Math.trunc(timestamp / 1000)
  return {
    channel: `trade.${currencies.code}`,
    actualChannel: null,
    subscribedChannel: `trade.${currencies.code}`,
    timetoken: timestamp,
    message: {
      trade: {
        date: stamp,
        tid: id,
        price: price,
        amount: quantity,
        askOrderId: ask,
        bidOrderId: bid,
        direction: direction
      },
      channel: `trade.${currencies.code}`,
      channelName: `trade.${currencies.code}`,
      currency: currencies.secondary.symbol,
      item: currencies.primary.symbol,
      stamp: stamp
    }
  }
}

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