import {List, Map} from 'immutable'
import CryptoJS from 'crypto-js'
import fetchival from 'fetchival'
import fetch from 'node-fetch'
import {getLogger} from '../common/logging'
import {withTimeout} from '../common/promises'
import Order, {Side} from '../domain/Order'
import ExchangeGateway from './ExchangeGateway'
import GatecoinPubNubSubscriber from './GatecoinPubNubSubscriber'

fetchival.fetch = fetch
const rest = fetchival

/**
 * gateway to the Gatecoin API
 * see: https://api.gatecoin.com/swagger-ui/index.html
 */
export default class Gatecoin extends ExchangeGateway {
  static from(config) {
    const {apiUrl, privateKey, publicKey, subscribeKey, timeout} = config
    return new Gatecoin(apiUrl, privateKey, publicKey, subscribeKey, timeout)
  }

  constructor(apiUrl, privateKey, publicKey, subscribeKey, timeout) {
    super('Gatecoin')
    this.apiUrl = apiUrl
    this.privateKey = privateKey
    this.publicKey = publicKey
    this.subscribeKey = subscribeKey
    this.timeout = timeout
    if (!this.isUp()) log.fatal(`${this} ${apiUrl} api is offline :-(`)
  }

  withOptions(method, url) {
    const contentType = method == 'GET' ? '' : 'application/json'
    const now = Date.now() / 1000
    const message = `${method}${url}${contentType}${now}`.toLowerCase()
    const signature = CryptoJS.enc.Base64.stringify(CryptoJS.HmacSHA256(message, this.privateKey))
    return {
      strictSSL: false,
      headers: {
        'API_PUBLIC_KEY': this.publicKey,
        'API_REQUEST_SIGNATURE': signature,
        'API_REQUEST_DATE': now,
        'Content-Type': contentType
      }
    }
  }

  async call(promise, url) { return withTimeout(this.timeout, promise, `calling ${url}`) }

  async isUp() {
    const endpoint = '/Ping'
    const url = `${this.apiUrl}${endpoint}?message=pong`
    return this.call(rest(url, this.withOptions('POST', url)).post(), url).
      then((response) => validate(response) && response.isConnected).
      catch(this.exceptionHandler)
  }

  async getCurrentOrdersFor(currencies) {
    const endpoint = '/Trade/Orders'
    const url = `${this.apiUrl}${endpoint}`
    return this.call(rest(url, this.withOptions('GET', url)).get(), url).
      then((response) => validate(response) && List(response.orders).
        filter(each => each.code == currencies.code).
        map(each =>
          new Order(Map({
            id: each.clOrderId,
            timestamp: fromSecondsStringToDate(each.date),
            currencies: currencies,
            side: (each.side == 1 ? Side.ask : Side.bid), //fixme: clarify numeric value conversion: ask = 1, bid = ?
            price: each.price,
            quantity: each.initialQuantity,
            remaining: each.remainingQuantity,
          })))).
      catch(this.exceptionHandler)
  }

  getLastExchangeRateFor(currencies) {
    const endpoint = '/Public/LiveTicker'
    const url = `${this.apiUrl}${endpoint}/${currencies.code}`
    return this.call(rest(url, this.withOptions('GET', url)).get(), url).
      then((response) => validate(response) && response.ticker.last).
      catch(this.exceptionHandler)
  }

  place(order) {
    const parameters = {
      Code: order.currencies.code,
      Way: order.side,
      Amount: order.quantity,
      Price: order.price,
    }
    const endpoint = '/Trade/Orders'
    const url = `${this.apiUrl}${endpoint}?${toQueryString(parameters)}`
    return this.call(rest(url, this.withOptions('POST', url)).post(), url).
      then((response) => validate(response) && response.clOrderId).
      catch(this.exceptionHandler)
  }

  cancel(order) {
    const endpoint = '/Trade/Orders'
    const url = `${this.apiUrl}${endpoint}/${order.id}`
    return this.call(rest(url, this.withOptions('DELETE', url)).delete(), url).
      then((response) => validate(response) && isOK(response)).
      catch(this.exceptionHandler)
  }

  subscribe(currencies, callback) {
    const channels = [`order.${currencies.code}`]
    this.subscriber = new GatecoinPubNubSubscriber(this.subscribeKey, channels, callback)
  }

  shutdown() { if (this.subscriber) this.subscriber.shutdown() }
}


const log = getLogger('Gatecoin')

const toQueryString = (parameters) => Map(parameters).map((v,k) => `${k}=${v}`).join('&')

const fromSecondsStringToDate = (seconds) => new Date(seconds * 1000)

const validate = (response) => isOK(response) ? true : throwError(response)
const isOK = (response) => response.responseStatus.message == 'OK'
const throwError = (response) => {
  const {errorCode, message} = response.responseStatus
  throw new Error(`[${errorCode}] ${message}`)
}
