import {Map} from 'immutable'
import {configure, print} from '../common/globals'
import {sleep} from '../common/promises'
import CurrencyPair from '../domain/CurrencyPair'
import Order, {Side} from '../domain/Order'
import Gatecoin from "./Gatecoin"
import GatecoinPubNubSubscriber, {tradeFrom} from './GatecoinPubNubSubscriber'


const callback = (order) => {
  print("CALLBACK called")
  print(JSON.stringify(order, null, 2))
  callbackResults.set(order.id, order)
}
const callbackResults = Map().asMutable()


describe('GatecoinPubNubSubscriber', () => {
  const config = configure('application.json').gateways.Gatecoin
  const currencies = CurrencyPair.of('BTC', 'USD')
  // const currencies = CurrencyPair.of('LEV', 'ETH')
  const now = new Date()
  const quantity = 10, price = 110.0

  describe('subscription', () => {
    const channels = [`order.${currencies.code}`]
    const subscriber = new GatecoinPubNubSubscriber(config.subscribeKey, channels, callback)
    const gateway = Gatecoin.from(config)

    afterEach(() => {
      if (!!gateway) gateway.shutdown()
      if (!!subscriber) subscriber.shutdown()
      callbackResults.clear()
    })

    it.skip('callback is called on proper trade', async () => {
      expect(callbackResults.isEmpty()).toBe(true)

      const ask = await gateway.place(Order.ask(quantity, price, currencies))
      await sleep(10)
      const bid = await gateway.place(Order.bid(quantity - 1, price, currencies))
      await sleep(10000) //give time for the orders to get published, and the trade to happen

      expect(callbackResults.isEmpty()).toBe(false)
      // expect(callbackResults.has(order.id)).toBe(true)
    }, 15000)

    it.skip('callback is ignore on improper trade', async () => {
      expect(callbackResults.isEmpty()).toBe(true)

      const ask = await gateway.place(Order.ask(quantity, price + 5, currencies))
      const bid = await gateway.place(Order.bid(quantity , price - 5, currencies))
      await sleep(1000) //give time for the order to get published
      // expect(callbackResults.has(ask.id)).toBe(false)
      // expect(callbackResults.has(bid.id)).toBe(false)
    })
  })

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
        status: 1
      },
      channel: `order.${code}`,
      channelName: `order.${code}`,
      currency: code.slice(3, 6),
      item: code.slice(0, 3),
      stamp: timestamp / 1000
    }
  }
}