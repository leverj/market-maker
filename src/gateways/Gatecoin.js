import ExchangeGateway from './ExchangeGateway'
import CryptoJS from 'crypto-js'
import fetchival from 'fetchival'
import fetch from 'node-fetch'


fetchival.fetch = fetch
const rest = fetchival


export default class Gatecoin extends ExchangeGateway {
  constructor(site, apiKey, exceptionHandler = (e) => console.log(`>>>>> ${e} <<<<<`)) {
    super()
    this.apiKey = apiKey
    this.exceptionHandler = exceptionHandler
    this.ping = `${site}/Ping`
    this.tickers = `${site}/Public/LiveTicker`
    this.orders = `${site}//Trade/Orders`
    // this.balances = `${site}/Balance/Balances`
    if (!this.isAlive()) console.log(`${site} api is offline :-(`)
  }

  options(settings) {
    const command = '???' //fixme: method?
    // const now = new Date()
    const now = nonce()
    const contentType = (settings.type == 'GET') ? '' : 'application/json'
    const uri = url + command
    const message = (settings.type + settings.url + command + contentType + now).toLowerCase()
    //signature = hmac.new(self.secret.encode(), msg=message_to_encrypt.encode(), digestmod=hashlib.sha256).digest()
    //signature_base64 = base64.b64encode(signature, altchars=None)
    const hash = CryptoJS.HmacSHA256(message, this.apiKey) //fixme: self.secret.encode() ???
    const signature = CryptoJS.enc.Base64.stringify(hash)
    return {
      headers: {
        'API_PUBLIC_KEY': this.apiKey,
        'API_REQUEST_SIGNATURE': signature,
        'API_REQUEST_DATE': new Date(),
        'Content-Type': contentType
      }
    }
  }

  isAlive() {
    const url = this.ping
    return rest(url, this.options({type: 'POST', url: url})).get().
      then((result) => result.IsConnected).
      catch(this.exceptionHandler)
  }

  getLastExchangeRateFor(currencyPair) {
    const url = `${this.tickers}/${currencyPair}`
    return rest(url, this.options({type: 'GET', url: url})).get().
      then((result) => result.ticker.last).
      catch(this.exceptionHandler)
  }

  place(order) {
    const parameters = {
      Code: order.currencies.code,
      Way: order.way,
      Amount: order.amount,
      Price: order.price,
      SpendAmount: 0, //fixme: SpendAmount is used in case of Buy MarketOrder, telling how much you are expecting to buy.
      // ExternalOrderID: '', // ExternalOrderID could be used as a reference for you
      // ValidationCode: '' // ValidationCode is the 2FA code if enables
    }
    const url = `${this.orders}/?${toQueryString(parameters)}`
    return rest(url, this.options({type: 'POST', url: url})).post().
      then((result) => order.placeWithId(result.ClOrderId)).
      catch(this.exceptionHandler)
  }

  cancel(order) {
    const url = `${this.orders}/${order.id}`
    return rest(url, this.options({type: 'DELETE', url: url})).delete().
      then((result) => result.ResponseStatus.ErrorCode). //fixme: clarify
      catch(this.exceptionHandler)
  }

  currentOrdersStatus() {
    const url = this.orders
    return rest(url, this.options({type: 'GET', url: url})).get().
      then((result) => result.ResponseStatus.ErrorCode). //fixme: clarify
      catch(this.exceptionHandler)
  }
}

const toQueryString = (parmeters) => parameters.map((v,k) => `${k}=${v}`).join('&')

const Nonce = function (length) {
  let last = null, repeat = 0
  if (typeof length == 'undefined') length = 15
  return function () {
    const now = Math.pow(10, 2) * +new Date()
    if (now == last)
      repeat++
    else {
      repeat = 0
      last = now
    }
    const s = (now + repeat).toString()
    return +s.substr(s.length - length)
  }
}
const nonce = Nonce()
// const nonce = (Math.random() * +new Date()).toString(36).replace(/[^a-z]/, '').substr(2)