import config from 'config'
import {Map} from 'immutable'
import {print} from '../common/globals'
import {sleep} from '../common/promises'
import CurrencyPair from '../domain/CurrencyPair'
import Order from '../domain/Order'
import Gatecoin from "./Gatecoin"
import GatecoinPubNubSubscriber from './GatecoinPubNubSubscriber'


const callback = (order) => {
  print("CALLBACK called")
  print(JSON.stringify(order, null, 2))
  callbackResults.set(order.id, order)
}
const callbackResults = Map().asMutable()


describe('GatecoinPubNubSubscriber integration-test', () => {
  const conf = config.get('gateways.Gatecoin')
  const currencies = CurrencyPair.of('LEV', 'ETH')
  const quantity = 10, price = 110.0

  describe.skip('subscription', () => {
    const channels = [`order.${currencies.code}`]
    const subscriber = new GatecoinPubNubSubscriber(conf.subscribeKey, channels, callback)
    const gateway = Gatecoin.from(conf)

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

})
