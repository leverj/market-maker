import {exceptionHandler, print} from '../common/test_helpers/utils'
import {sleep} from '../common/promises'
import Currency from '../domain/Currency'
import Order from '../domain/Order'
import Gatecoin from './Gatecoin'
import {config} from '../config'


/**
 * these tests hit a live Gatecoin api server, so by default they are skipped
 *
 * !!!!! Be aware that running the tests wipes out all current trades for specifified <currencies> !!!!!
 * (we might want to change this)
 */
// describe('Gatecoin api', () => {
describe.skip('Gatecoin api', () => {
  const gateway = new Gatecoin(config.gateways.Gatecoin_test, exceptionHandler)
  const currencies = Currency.pair(Currency.of('BTC'), Currency.of('USD'))

  it('api should be connected', async () => {
    expect(await gateway.isUp())
  })

  it(`should get live ticker for ${currencies}`, async () => {
    const exchangeRate = await gateway.getLastExchangeRateFor(currencies)
    print(`${currencies} current exchange rate: ${exchangeRate}`)
    expect(exchangeRate).toBeGreaterThan(0)
  })

  it(`should get currently placed orders for ${currencies}`, async () => {
    const orders = await gateway.getCurrentOrdersFor(currencies)
    print(`# of current orders: ${orders.size}`)
    if (!orders.isEmpty()) print(`cancelled unexpected ${orders.size} orders: ${await Promise.all(orders.map(each => gateway.cancel(each)))}`)
    expect(orders.size).toBe(0)
  })

  it(`should place an order and return its assigned id`, async () => {
    const quantity = 2, price = 999e+12 // deliberately unreasonably high to ensure it would not be fulfilled
    const order = Order.ask(quantity, price, currencies)
    const orderId = await gateway.place(order)
    print(`Order [${orderId}] placed`)
    expect(!!orderId).toBe(true)

    // give it some time, then clean up ...
    await sleep(10)
    const toCancel = order.placeWith(orderId)
    expect(await gateway.cancel(toCancel)).toBe(true)
    print(`Order [${orderId}] cancelled`)
  })

  it(`should not cancel a non-existing order`, async () => {
    try {
      await gateway.cancel({id: 'no-such-order'})
      fail("should throw")
    } catch(e) {
      expect(e.message).toMatch(/Order does not exist/)
    }
  })
})
