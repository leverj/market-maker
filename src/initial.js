import OrderBook from './domain/OrderBook'
import Currency from './domain/Currency'
import Exchange from './domain/Exchange'
import SpreadStrategy from './domain/SpreadStrategy'
import MarketMaker from './domain/MarketMaker'
import StubbedGateway from './common/test_helpers/StubbedGateway'
import Gatecoin from './gateways/Gatecoin'
import {config} from './config'
import {exceptionHandler} from './common/globals'
import * as promise from './common/promises'


const currencies = Currency.pairOf('LEV', 'ETH')

export const emptyBook = OrderBook.of(currencies)

const makeSpreadStrategy = (config) => SpreadStrategy.fixed(config.depth, config.quantity, config.step)
const makeGateway = (config) => new Gatecoin(config, exceptionHandler)
const chooseGateway = (env, config) => {
  switch (env) {
    case 'dev': return new StubbedGateway()
    case 'staging': return makeGateway(config.Gatecoin_test)
    case 'production': return makeGateway(config.Gatecoin) //fixme: using this for production
  }
  throw new Error(`unrecognized environment parameter: ${env}`)
}

export const makeMarketMaker = () => {
  const gateway = chooseGateway(config.env, config.gateways)
  const exchange = new Exchange(gateway)
  const strategy = makeSpreadStrategy(config.strategies.fixed)
  return promise.withTimeout(2000, MarketMaker.of(exchange, strategy, emptyBook).synchronized(), 'initialing Market Maker')
}

