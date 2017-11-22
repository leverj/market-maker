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
  }

  options(settings) {
    const contentType = (settings.type == 'GET') ? '' : 'application/json';
    const message = settings.type + settings.url + contentType + new Date();
    const hash = CryptoJS.HmacSHA256(message.toLowerCase(), this.apiKey);
    const signature = CryptoJS.enc.Base64.stringify(hash);
    return {
      headers: {
        'API_PUBLIC_KEY': this.apiKey,
        'API_REQUEST_SIGNATURE': signature,
        'API_REQUEST_DATE': new Date()
      }
    }
  }

  isAlive() {
    const url = this.ping
    return rest(url, this.options({type: 'POST', url: url})).get().
      then((result) => result.IsConnected). //fixme: clarify
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
      //fixme: clarify
      SpendAmount: "what's that?",
      ExternalOrderID: "what's that?",
      ValidationCode: "what's that?"
    }
    const body = {
      AddOrder: {fixme: "what's that?"},
    }
    const url = `${this.orders}/?${toQueryString(parameters)}`
    return rest(url, this.options({type: 'POST', url: url})).post(body).
      then((result) => order.placeWithId(result.ClOrderId)). //fixme: clarify
      catch(this.exceptionHandler)
  }

  cancel(order) {
    const url = `${this.orders}/${order.id}`
    const body = {
      CancelOrder: {fixme: "what's that?"},
    }
    return rest(url, this.options({type: 'DELETE', url: url})).delete(body).
      then((result) => result.ResponseStatus.ErrorCode). //fixme: clarify
      catch(this.exceptionHandler)
  }
}

const toQueryString = (parmeters) => parameters.map((v,k) => `${k}=${v}`).join('&')