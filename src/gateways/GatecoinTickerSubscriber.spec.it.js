import config from 'config'
import {List} from 'immutable'
import {sleep} from '../common/promises'
import CurrencyPair from '../domain/CurrencyPair'
import Order from '../domain/Order'
import Gatecoin from "./Gatecoin"
import Exchange from "../domain/Exchange"


const callback = (price) => {
  callbackResults.push(price)
}
const callbackResults = List().asMutable()
const orders = List().asMutable()

/**
 * these tests hit a live Gatecoin api server, so by default they are skipped
 */
describe.skip('GatecoinTickerSubscriber integration-test', () => {
  const currencies = CurrencyPair.of('LEV', 'ETH')
  let exchange = null

  beforeAll(() => {
    exchange = new Exchange(Gatecoin.from(config.get('gateways.Gatecoin')))
    exchange.subscribe(currencies, callback)
  })

  afterEach(async () => {
    await Promise.all(orders.map(each => exchange.cancel(each)))
    orders.clear()
    callbackResults.clear()
  })

  afterAll(() => exchange.shutdown())

  it('subscription - callback is called on price change', async () => {
    const initialPrice = await exchange.getLastExchangeRateFor(currencies)
    expect(callbackResults.size).toBe(0)

    const pollingInterval = config.get('gateways.Gatecoin.pollingInterval')
    await sleep(5 * pollingInterval)
    expect(callbackResults.size).toBe(1)
    expect(callbackResults.first()).toEqual(initialPrice)

    const quantity = 10, price = initialPrice * 2
    const ask = await exchange.place(Order.ask(quantity, price, currencies))
    const bid = await exchange.place(Order.bid(1, price, currencies))
    orders.push(ask, bid)
    await sleep(3000) //give time for the orders to get published, and the trade to happen
    // printJson(callbackResults)
    expect(callbackResults.size).toBe(2)
    expect(callbackResults.last()).toEqual(price)
  })

})
