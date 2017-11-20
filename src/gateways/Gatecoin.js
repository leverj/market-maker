import ExchangeGateway from './ExchangeGateway'
import CryptoJS from 'crypto-js'
import fetchival from 'fetchival'
import fetch from 'node-fetch'

fetchival.fetch = fetch

export default class Gatecoin extends ExchangeGateway {
  constructor(site, apiKey) {
    super()
    this.apiKey = apiKey
    this.exceptionHandler = (e) => console.log(`>>>>> ${e} <<<<<`)
    this.tickers = `${site}/Public/LiveTicker`
    this.resource = `${site}/path/to/resource`
  }

  options(httpMethod, url) {
    const settings = {type: httpMethod, url: url} 
    const contentType = (httpMethod == 'GET') ? '' : 'application/json';
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

  getLastExchangeRateFor(currencyPair) {
    const url = `${this.tickers}/${currencyPair}`
    return fetchival(url, this.options()).get().
      then((result) => result.ticker.last).
      catch(this.exceptionHandler)
  }
}
