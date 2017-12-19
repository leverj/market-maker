import config from 'config'
import {List, Map} from 'immutable'
import {print, printJson} from '../common/globals'
import {sleep} from '../common/promises'
import CurrencyPair from '../domain/CurrencyPair'
import Order from '../domain/Order'
import Gatecoin from "./Gatecoin"
import GatecoinPubNubSubscriber from './GatecoinPubNubSubscriber'
import Exchange from "../domain/Exchange"


const callback = (trade) => {
  // print("CALLBACK called")
  // printJson(trade)
  callbackResults.set(trade.id, trade)
}
const callbackResults = Map().asMutable()
const orders = List().asMutable()

/**
 * these tests hit a live Gatecoin api server, so by default they are skipped
 */
describe.skip('GatecoinPubNubSubscriber integration-test', () => {
  const quantity = 10, price = 10.1
  const currencies = CurrencyPair.of('LEV', 'ETH')
  const exchange = new Exchange(Gatecoin.from(config.get('gateways.Gatecoin')))
  const subscriber = new GatecoinPubNubSubscriber(config.get('gateways.Gatecoin.subscribeKey'), currencies, callback)

  afterEach(() => callbackResults.clear())

  afterAll(async () => {
    if (!!subscriber) subscriber.shutdown()
    await Promise.all(orders.map(each => exchange.cancel(each)))
  })

  it('subscription - callback is called on proper trade', async () => {
    expect(callbackResults.isEmpty()).toBe(true)

    const ask = await exchange.place(Order.ask(quantity, price, currencies))
    const bid = await exchange.place(Order.bid(1, price, currencies))
    orders.push(ask, bid)
    orders.forEach(each => print(`placed: ${each.toLongString()}`))
    await sleep(9000) //give time for the orders to get published, and the trade to happen

    expect(callbackResults.isEmpty()).toBe(false)
    expect(callbackResults.has(order.id)).toBe(true)
  }, 10000)

  it('callback is ignore on improper trade', async () => {
    expect(callbackResults.isEmpty()).toBe(true)

    const ask = await exchange.place(Order.ask(quantity, price + 5, currencies))
    const bid = await exchange.place(Order.bid(quantity , price - 5, currencies))
    orders.push(ask, bid)
    orders.forEach(each => print(`placed: ${each.toLongString()}`))
    await sleep(1000) //give time for the order to get published
    // expect(callbackResults.has(ask.id)).toBe(false)
    // expect(callbackResults.has(bid.id)).toBe(false)
  })

})
