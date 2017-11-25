import {exceptionHandler, print, sleep} from '../helpers/testing/utils'
import Currency from '../domain/Currency'
import Order from '../domain/Order'
import Gatecoin from './Gatecoin'
import {config} from '../config'


/**
 * these tests hit a live Gatecoin api server, so by default they are skipped
 */
// describe('Gatecoin api', () => {
describe.skip('Gatecoin api', () => {
  const gateway = new Gatecoin(config.Gatecoin, exceptionHandler)
  const currencies = Currency.pair(Currency.of('BTC'), Currency.of('USD'))

  it('api should be connected', async () => {
    expect(await gateway.isAlive())
  })

  it(`should get live ticker for ${currencies}`, async () => {
    const exchangeRate = await gateway.getLastExchangeRateFor(currencies)
    print(exchangeRate)
    expect(exchangeRate).toBeGreaterThan(0)
  })

  it(`should get currently placed orders for ${currencies}`, async () => {
    const orders = await gateway.getCurrentOrdersFor(currencies)
    print(`${orders.size} orders`)
    if (!orders.isEmpty()) print(`cancelled unexpected ${orders.size} orders: ${await Promise.all(orders.map(each => gateway.cancel(each)))}`)
    expect(orders.size).toBe(0)
  })

  it.skip(`should place an order and return its assigned id`, async () => {
  // it.only(`should place an order and return its assigned id`, async () => {
  // it(`should place an order and return its assigned id`, async () => {
    const quantity = 2, price = 999e+12 // deliberately unreasonably high to ensure it would not be fulfilled
    const order = Order.ask(quantity, price, currencies)
    const orderId = await gateway.place(order)
    print(`placed order ${orderId}`)
    expect(!!orderId).toBe(true)

    // better clean up ...
    // await sleep(1000)
    const cancelled = await gateway.cancel(order) //fixme: broken :-(
    print(`cancelled order ${orderId}: ${cancelled}`)
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
