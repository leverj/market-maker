import PubNub from 'pubnub'

import {exceptionHandler} from '../common/globals'


export default class TradeSubscriber {
  constructor(name, channels, callback) {
    this.name = name
    this.channels = channels
    this.callback = callback
    this.exceptionHandler = exceptionHandler
  }
  toString() { return `[${this.name}] : ${this.channels}` }

  /** an opportunity to cleanup resources */
  shutdown() {  /* by default, do nothing */ }
}


