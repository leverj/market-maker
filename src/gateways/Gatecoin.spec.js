import Currency from '../domain/Currency'
import Order from '../domain/Order'
import Gatecoin from './Gatecoin'
import {config} from '../config'


describe('Gatecoin api api', () => {
  const gateway = new Gatecoin(config.Gatecoin, (e) => console.log(`>>>>> ${e} <<<<<`))
  const currencies = Currency.pair(Currency.from('BTC'), Currency.from('USD'))

  it.skip('api should be connected', async () => {
    expect(await gateway.isAlive())
  })

  it.skip(`should get live ticker for ${currencies}`, async () => {
    const exchangeRate = await gateway.getLastExchangeRateFor(currencies)
    print(exchangeRate)
    expect(exchangeRate).toBeGreaterThan(0)
  })

  it.skip(`should get currently placed orders for ${currencies}`, async () => {
    const orders = await gateway.getCurrentOrdersFor(currencies)
    print(orders)
    // expect(orders.isEmpty)
  })

  it.skip(`should place an order and return its newly assigned id`, async () => {
    const amount = 2, price = 999e+12 // deliberately unreasonably high to ensure it would not be fulfilled
    const order = Order.ask(amount, price, currencies)
    const orderId = await gateway.place(order)
    print(orderId)
    expect(!orderId.isEmpty)
  })

  it.skip(`should not cancel a non-existing order`, async () => {
    const response = await gateway.cancel({id: 'crap'}) //fixme: something's wrong
    print(response)
  })
})

function print(value) {
  console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>')
  console.log(value)
  console.log('<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<')
}
