import {exceptionHandler} from './common/globals'
import Currency from './domain/Currency'
import Exchange from './domain/Exchange'
import SpreadStrategy from './domain/SpreadStrategy'
import MarketMaker from './domain/MarketMaker'
import StubbedGateway from './common/test_helpers/StubbedGateway'
import Gatecoin from './gateways/Gatecoin'
import {config} from './config'


export function makeMarketMaker() {

  const chooseGateway = (env, config) => {
    switch (env) {
      case 'dev': return new StubbedGateway()
      case 'staging': return new Gatecoin(config.Gatecoin_test, exceptionHandler)
      case 'production': return new Gatecoin(config.Gatecoin, exceptionHandler) //fixme: using this for production
    }
    throw new Error(`unrecognized environment parameter: ${env}`)
  }

  const gateway = chooseGateway(config.env, config.gateways)
  const exchange = new Exchange(gateway)
  const {depth, quantity, step} = config.strategies.fixed
  const strategy = SpreadStrategy.fixed(depth, quantity, step)
  const currencies = Currency.pairOf('LEV', 'ETH')
  return MarketMaker.of(exchange, strategy, currencies)
}
