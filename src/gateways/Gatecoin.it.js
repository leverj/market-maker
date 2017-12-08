import config from 'config'
import {print} from '../common/globals'
import {sleep} from '../common/promises'
import CurrencyPair from '../domain/CurrencyPair'
import Order from '../domain/Order'
import Gatecoin from './Gatecoin'


/**
 * these tests hit a live Gatecoin api server, so by default they are skipped
 */
describe.skip('Gatecoin api integration-test', () => {
  const gateway = Gatecoin.from(config.get('gateways.Gatecoin'))
  const currencies = CurrencyPair.of('LEV', 'ETH')

  it('api should be connected', async () => {
    expect(await gateway.isUp())
  })

  it(`get live ticker for ${currencies}`, async () => {
    const exchangeRate = await gateway.getLastExchangeRateFor(currencies)
    print(`${currencies} current exchange rate: ${exchangeRate}`)
    expect(exchangeRate).toBeGreaterThan(0)
  })

  it(`get currently placed orders for ${currencies}`, async () => {
    const orders = await gateway.getCurrentOrdersFor(currencies)
    print(`# of current orders: ${orders.size}`)
    expect(orders.size).toBe(0)
  })

  it(`place an order and return its assigned id`, async () => {
    const quantity = 2, price = 999e+12 // deliberately unreasonably high to ensure it would not be fulfilled
    const order = Order.ask(quantity, price, currencies)
    const orderId = await gateway.place(order)
    print(`Order [${orderId}] placed`)
    expect(!!orderId).toBe(true)

    // give it some time, then clean up ...
    await sleep(100)
    const toCancel = order.placeWith(orderId)
    expect(await gateway.cancel(toCancel)).toBe(true)
    print(`Order [${orderId}] cancelled`)
  })

  it(`does not cancel a non-existing order`, async () => {
    try {
      await gateway.cancel({id: 'no-such-order'})
      fail('should throw')
    } catch(e) {
      expect(e.message).toMatch(/Order does not exist/)
    }
  })

  it.skip(`<<< NOTE >>> if there's ever a need to cleanup all orders, this is a convenient way to do it`, async () => {
    const orders = await gateway.getCurrentOrdersFor(currencies)
    print(`# of current orders: ${orders.size}`)
    if (!orders.isEmpty())
      print(`cancelled unexpected ${orders.size} orders: ${await Promise.all(orders.map(each => gateway.cancel(each)))}`)
  })
})
