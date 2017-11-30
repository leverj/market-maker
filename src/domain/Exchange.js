
export default class Exchange {
  constructor(gateway) {
    this.gateway = gateway
  }
  toString() { return `${this.gateway.name} Exchange` }

  async getCurrentOrdersFor(currencies) { return this.gateway.getCurrentOrdersFor(currencies) }
  async getLastExchangeRateFor(currencies) { return this.gateway.getLastExchangeRateFor(currencies) }
  async place(order) { return this.gateway.place(order).then(id => order.placeWith(id, new Date)) }
  async cancel(order) { return this.gateway.cancel(order) }

  registerOnTradeCallback(callback) { this.gateway.registerOnTradeCallback(callback) }
}

