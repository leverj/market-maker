import PubNub from 'pubnub'
import {getLogger} from '../common/globals'
import {TradeSubscriber} from './ExchangeGateway'
import CurrencyPair from '../domain/CurrencyPair'
import Order, {Side} from '../domain/Order'
import {Map} from "immutable"


/**
 * a push-based subscriber to Gatecoin order's trading notifications
 * see: https://github.com/Gatecoin/Streaming-API-Implementation/blob/master/README.md
 */
export class GatecoinPubNubSubscriber extends TradeSubscriber {

  static tradeFrom(message) {
    const {oid, code, side, price, initAmount, remainAmout, status} = message.order
    // const timestamp = order.stamp //fixme: convert to UTC date, or just ignore the whole thing ?
    const currencies = CurrencyPair.get(code)
    return new Order(Map({
      id: oid,
      timestamp: undefined,
      currencies: currencies.map,
      side: (side == 0 ? Side.ask : Side.bid),
      price: price,
      quantity: initAmount,
      remaining: remainAmout,
    }))
  }

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
    this.verifyConnection()
    /*
      message: function(m) {
        // handle message
        var actualChannel = m.actualChannel;
        var channelName = m.channel; // The channel for which the message belongs
        var msg = m.message; // The Payload
        var publisher = m.publisher;
        var subscribedChannel = m.subscribedChannel;
        var channelGroup = m.subscription; // The channel group or wildcard subscription match (if exists)
        var pubTT = m.timetoken; // Publish timetoken
      },
     */
    this.listener = this.pubnub.addListener({
      message: (message) => this.callback(this.tradeFrom(message))
    })
    this.pubnub.subscribe({channels: this.channels})
  }

  //fixme: is this an async call?
  verifyConnection() {
    this.pubnub.time((status, response) => {
      status.error ?
        this.exceptionHandler(status.error) :
        log.info(`${this} subscription is on (${response.timetoken})`)
    })
  }

  unsubscribe() {
    this.pubnub.removeListener(this.listener)
    this.pubnub.unsubscribe({channels: this.channels})
    log.info(`${this} subscription is off`)
  }

  shutdown() { this.unsubscribe() }
}


const log = getLogger('Gatecoin')

