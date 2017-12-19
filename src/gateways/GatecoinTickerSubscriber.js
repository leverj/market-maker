import fetchival from 'fetchival'
import fetch from 'node-fetch'
import {getLogger} from '../common/logging'
import {exceptionHandler} from '../common/globals'

fetchival.fetch = fetch
const rest = fetchival


/**
 * a 'subscriber' polling for Gatecoin last ticker price changes
 */
export default class GatecoinTickerSubscriber {
  static from(apiUrl, currencies, interval, callback) {
    const url = `${apiUrl}/Public/LiveTicker/${currencies.code}`
    return new GatecoinTickerSubscriber(url, interval, callback)
  }

  constructor(url, interval, callback) {
    this.exceptionHandler = exceptionHandler
    this.price = 0
    const getLastPrice = async () => await rest(url).get().
      then(response => validate(response) && response.ticker.last).
      then(price => {
        if (price != this.price) {
          this.price = price
          callback(price)
        }
      }).
      catch(this.exceptionHandler)
    this.pollingId = setInterval(getLastPrice, interval)
  }

  toString() { return `[every ${interval} millis] ${url} poller` }

  shutdown() {
    clearInterval(this.pollingId)
    log.info(`${this} is off`)
  }
}


const log = getLogger('Gatecoin')

const validate = (response) => isOK(response) ? true : throwError(response)
const isOK = (response) => response.responseStatus.message == 'OK'
const throwError = (response) => {
  const {errorCode, message} = response.responseStatus
  throw new Error(`[${errorCode}] ${message}`)
}
