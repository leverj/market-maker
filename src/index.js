import {makeMarketMakers} from './initial'
import {notifyOps} from './common/globals'
import config from 'config'

makeMarketMakers().map(each => each.synchronize())

const markets = config.get('markets').map(each => each.currencies).map(each => `${each.primary}/${each.secondary}`)
const message = `starting market makers for currencies: \n\t${markets.join('\n\t')}`
switch (process.env.NODE_ENV) {
  case 'production': notifyOps(message)
  default: console.info(message)
}



