import {List, Map} from 'immutable'
import CryptoJS from 'crypto-js'
import fetchival from 'fetchival'
import fetch from 'node-fetch'
import ExchangeGateway from './ExchangeGateway'


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
    const contentType = method == 'GET' ? '' : 'application/json'
    const now = +new Date() / 1000
    const message = `${method}${url}${contentType}${now}`.toLowerCase()
    const hash = CryptoJS.HmacSHA256(message, this.config.privateKey)
    const signature = CryptoJS.enc.Base64.stringify(hash)
    return {
      url: url,
      strictSSL: false,
      method: method,
      headers: {
        'API_PUBLIC_KEY': this.config.publicKey,
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
      then((response) => response.isConnected).
      catch(this.exceptionHandler)
  }

  async getCurrentOrdersFor(currencies) {
/*
     { orders:
         [ { code: 'BTCUSD',
             clOrderId: 'BK11492580104',
             side: 1,
             price: 999000000000000,
             initialQuantity: 2,
             remainingQuantity: 2,
             status: 1,
             statusDesc: 'New',
             tranSeqNo: 0,
             type: 0,
             date: '1511506668' },
OpenOrder {
  Code (string),
  ClOrderId (string),
  OrigClOrderId (string), //optional
  Side (byte),
  Price (double),
  InitialQuantity (double),
  RemainingQuantity (double),
  Status (byte),
  StatusDesc (string),
  TranSeqNo (long),
  Type (byte),
  Date (Date),
  Trades (Array[TraderTransaction]) //optional
}
  TraderTransaction {
  TransactionId (long),
  TransactionTime (Date),
  AskOrderID (string),
  BidOrderID (string),
  Price (double),
  Quantity (double),
  CurrencyPair (string),
  Way (string),
  FeeRole (string),
  FeeRate (double),
  FeeAmount (double)
}
 */
    const endpoint = '/Trade/Orders'
    const url = `${this.config.apiUrl}${endpoint}`
    return rest(url, this.options('GET', url)).get().
      then((response) => response).
      // then((response) => List(response.orders).filter(each => each.code == currencies.code)).
      catch(this.exceptionHandler)
  }

  getLastExchangeRateFor(currencies) {
    const endpoint = '/Public/LiveTicker'
    const url = `${this.config.apiUrl}${endpoint}/${currencies.code}`
    return rest(url, this.options('GET', url)).get().
      then((response) => response.ticker.last).
      catch(this.exceptionHandler)
  }

  place(order) {
    const parameters = {
      Code: order.currenciesCode,
      Way: order.way,
      Amount: order.amount,
      Price: order.price,
      // SpendAmount: 0, // used in case of Buy MarketOrder, telling how much you are expecting to buy.
    }
    const endpoint = '/Trade/Orders'
    const url = `${this.config.apiUrl}${endpoint}?${toQueryString(parameters)}`
    return rest(url, this.options('POST', url)).post().
      then((response) => check(response)).
      then((response) => response.clOrderId).
      catch(this.exceptionHandler)
  }

  cancel(order) {
    const endpoint = '/Trade/Orders'
    const url = `${this.config.apiUrl}${endpoint}/${order.id}`
    return rest(url, this.options('DELETE', url)).delete().
      then((response) => check(response)).
      then((response) => response).
      catch(this.exceptionHandler)
  }
}

const check = (response) => isOK(response) ? response : throwError(response)
const isOK = (response) => response.responseStatus.message == 'OK'
const throwError = (response) => {
  const {errorCode, message} = response.responseStatus
  throw new Error(`[${errorCode}] ${message}`)
}

const toQueryString = (parameters) => Map(parameters).map((v,k) => `${k}=${v}`).join('&')
