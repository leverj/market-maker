import OrderBook from './domain/OrderBook'
import Currency from './domain/Currency'
import Exchange from './domain/Exchange'
import SpreadStrategy from './domain/SpreadStrategy'
import MarketMaker from './domain/MarketMaker'
import StubbedGateway from './common/test_helpers/StubbedGateway'
import Gatecoin from './gateways/Gatecoin'
import {config} from './config'


const currencies = Currency.pairOf('LEV', 'ETH')
export const emptyBook = OrderBook.of(currencies)

export const makeMarketMaker = (book) => {
  const exceptionHandler = (e) => {
    //fixme: we need real logging ...
    console.log(`>>>>> ${e} <<<<<`)
    //fixme: and either and swallowing or gracefully shutdown
    //throw e
  }
  const chooseGateway = (env, config) => {
    switch (env) {
      case 'dev': return new StubbedGateway()
      case 'staging': return new Gatecoin(config.Gatecoin_test, exceptionHandler)
      case 'production': return new Gatecoin(config.Gatecoin, exceptionHandler) //fixme: using this for production
    }
    throw new Error(`unrecognized environment parameter: ${env}`)
  }
  const makeSpreadStrategy = (config) => SpreadStrategy.fixed(config.depth, config.quantity, config.step)

  const gateway = chooseGateway(config.env, config.gateways)
  const exchange = new Exchange(gateway)
  const strategy = makeSpreadStrategy(config.strategies.fixed)
  return MarketMaker.of(exchange, strategy, currencies)
}
