import {getLogger} from '../common/logging'
import PubNub from 'pubnub'
import {TradeSubscriber} from './ExchangeGateway'
import CurrencyPair from '../domain/CurrencyPair'
import Order, {Side} from '../domain/Order'


/**
 * a push-based subscriber to Gatecoin order's trading notifications
 * see: https://github.com/Gatecoin/Streaming-API-Implementation/blob/master/README.md
 */
export default class GatecoinPubNubSubscriber extends TradeSubscriber {

  constructor(subscribeKey, channels, callback) {
    super('Gatecoin.PubNub', channels, callback)
    /*
    this.pubnub = new PubNub({
      uuid: `leverj_${new Date()}`,
      uuid: PubNub.generateUUID(),
      subscribeKey: config.subscribeKey,
      ssl: false,
      keepAlive: true,
    })
    pubnub.setFilterExpression(filterExpression)
    */
    this.pubnub = new PubNub({ subscribeKey: subscribeKey })
    this.subscribe()
  }
  toString() { return `${this.name} subscriber [${this.channels}]` }

  subscribe() {
    try {
      this.verifyConnection()
      this.listener = this.pubnub.addListener({
        message: (orderMessage) => {
          const trade = tradeFrom(orderMessage)
          /* trade is null if conversion failed */
          if (!!trade) this.callback(trade)
        }
      })
      this.pubnub.subscribe({channels: this.channels})
    } catch(e) {
      throw new Error(`failed to subscribe to PubNub: ${e}`)
    }
  }

  verifyConnection() {
    this.pubnub.time((status, response) => {
      if (status.error) throw new Error(`cannot connect to PubNub: ${status} - ${response}`)
      else log.info(`${this} subscription is on (${response.timetoken})`)
    })
  }

  unsubscribe() {
    this.pubnub.removeListener(this.listener)
    this.pubnub.unsubscribe({channels: this.channels})
    log.info(`${this} subscription is off`)
  }

  shutdown() { this.unsubscribe() }
}


const log = getLogger('Gatecoin.PubNub')

/** returns null if irrelevant, or if conversion failed */
export const tradeFrom = (orderMessage) => {
  try {
    const trade = orderMessage.message
    const {oid, code, side, price, initAmount, remainAmout, status} = trade.order
    if (!CurrencyPair.has(code)) return null // ignore
    if (remainAmout == initAmount) return null // ignore
    if (status == 1) return null // ignore: 1 = New, 2 = Filling

    const timestamp = new Date(trade.stamp * 1000)
    const currencies = CurrencyPair.get(code)
    const theSide = (side == 0) ? Side.bid : Side.ask // Bid = 0 and Ask = 1
    return Order.of(theSide, initAmount, price, currencies).withRemaining(remainAmout).placeWith(oid, timestamp)
  } catch (e) {
    log.warn('bad trade: %s', orderMessage, e)
    return null
  }
}

