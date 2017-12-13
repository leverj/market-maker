import {makeMarketMakers} from './initial'
import {notifyOps, exceptionHandler} from './common/globals'

const makers = makeMarketMakers()
makers.map(each => each.synchronize().catch(e => {
  console.warn(`houston we have a problem`, e)
})) //fixme: these are promises

const message = `starting market makers for currencies:\n   ${makers.map(each => each.currencies).join(', ')}`
switch (process.env.NODE_ENV) {
  case 'production': notifyOps(message)
  default: console.info(message)
}
