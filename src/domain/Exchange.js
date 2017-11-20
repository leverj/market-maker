
export default class Exchange {
  constructor(name, gateway) {
    this.name = name
    this.gateway = gateway
  }

  toString() { return `${this.name} Exchange` }

  getLastExchangeRateFor(currencies) { return this.gateway.getLastExchangeRateFor(currencies) }
  // async getLastExchangeRateFor(currencies) { return await this.gateway.getLastExchangeRateFor(currencies.code) }
  place(order) { return this.gateway.place(order) }
  cancel(order) { return this.gateway.cancel(order) }
}

