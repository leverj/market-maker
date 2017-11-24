import {List, Map} from 'immutable'
import CryptoJS from 'crypto-js'
import fetchival from 'fetchival'
import fetch from 'node-fetch'
import ExchangeGateway from './ExchangeGateway'
import Order, {Side} from '../domain/Order'


fetchival.fetch = fetch
const rest = fetchival


//fixme: configure time out for all Promises
export default class Gatecoin extends ExchangeGateway {
  constructor(config, exceptionHandler) {
    super()
    this.config = config
    this.exceptionHandler = exceptionHandler
    if (!this.isAlive()) console.log(`${apiUrl} api is offline :-(`)
  }

  options(method, url) {
    const {privateKey, publicKey} = this.config
    const contentType = method == 'GET' ? '' : 'application/json'
    const now = +new Date() / 1000
    const message = `${method}${url}${contentType}${now}`.toLowerCase()
    const signature = CryptoJS.enc.Base64.stringify(CryptoJS.HmacSHA256(message, privateKey))
    return {
      strictSSL: false,
      headers: {
        'API_PUBLIC_KEY': publicKey,
        'API_REQUEST_SIGNATURE': signature,
        'API_REQUEST_DATE': now,
        'Content-Type': contentType
      }
    }
  }

  isAlive() {
    const endpoint = '/Ping'
    const url = `${this.config.apiUrl}${endpoint}?message=pong`
    return rest(url, this.options('POST', url)).post().
      then((response) => validate(response) && response.isConnected).
      catch(this.exceptionHandler)
  }

  async getCurrentOrdersFor(currencies) {
    const endpoint = '/Trade/Orders'
    const url = `${this.config.apiUrl}${endpoint}`
    return rest(url, this.options('GET', url)).get().
      then((response) => validate(response) && List(response.orders).
        filter(each => each.code == currencies.code).
        map(each =>
          Order.from(
            (each.side == 1 ? Side.ask : Side.bid),
            each.initialQuantity,
            each.price,
            currencies,
            each.clOrderId))).
      catch(this.exceptionHandler)
  }

  getLastExchangeRateFor(currencies) {
    const endpoint = '/Public/LiveTicker'
    const url = `${this.config.apiUrl}${endpoint}/${currencies.code}`
    return rest(url, this.options('GET', url)).get().
      then((response) => validate(response) && response.ticker.last).
      catch(this.exceptionHandler)
  }

  place(order) {
    const parameters = {
      Code: order.currenciesCode,
      Way: order.side,
      Amount: order.quantity,
      Price: order.price,
    }
    const endpoint = '/Trade/Orders'
    const url = `${this.config.apiUrl}${endpoint}?${toQueryString(parameters)}`
    return rest(url, this.options('POST', url)).post().
      then((response) => validate(response) && response.clOrderId).
      catch(this.exceptionHandler)
  }

  cancel(order) {
    const endpoint = '/Trade/Orders'
    const url = `${this.config.apiUrl}${endpoint}/${order.id}`
    return rest(url, this.options('DELETE', url)).delete().
      then((response) => validate(response) && isOK(response)).
      catch(this.exceptionHandler)
  }
}

const validate = (response) => isOK(response) ? true : throwError(response)
const check = (response) => isOK(response) ? response : throwError(response)
const isOK = (response) => response.responseStatus.message == 'OK'
const throwError = (response) => {
  const {errorCode, message} = response.responseStatus
  throw new Error(`[${errorCode}] ${message}`)
}

const toQueryString = (parameters) => Map(parameters).map((v,k) => `${k}=${v}`).join('&')
