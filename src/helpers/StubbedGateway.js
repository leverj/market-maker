export default class StubbedGateway {
  constructor() { this._exchangeRate = 0 }
  set exchangeRate(value) { this._exchangeRate = value }

  getLastExchangeRateFor(currencies) { return Promise.resolve(this._exchangeRate) }
  place(order) { return Promise.resolve(order.placeWithId(`id-${uuid()}`)) }
  cancel(order) { return Promise.resolve(order) }
}

