
export default class Exchange {
  constructor(name, gateway) {
    this.name = name
    this.gateway = gateway
  }
  toString() { return `${this.name} Exchange` }

  async getCurrentOrdersFor(currencies) { return this.gateway.getCurrentOrdersFor(currencies) }
  async getLastExchangeRateFor(currencies) { return this.gateway.getLastExchangeRateFor(currencies) }
  async place(order) { return this.gateway.place(order).then(id => order.placeWith(id, new Date)) }
  async cancel(order) { return this.gateway.cancel(order) }
}

