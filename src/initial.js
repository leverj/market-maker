import {exceptionHandler} from './common/globals'
import Exchange from './domain/Exchange'
import MarketMaker from './domain/MarketMaker'
import StubbedGateway from './common/test_helpers/StubbedGateway'
import Gatecoin from './gateways/Gatecoin'
import {config} from './config'


const chooseGateway = (env) => {
  switch (env) {
    case 'dev': return new StubbedGateway()
    case 'staging': return new Gatecoin(config.Gatecoin_test, exceptionHandler)
    case 'production': return new Gatecoin(config.Gatecoin, exceptionHandler) //fixme: using this for production
  }
  throw new Error(`unrecognized environment parameter: ${env}`)
}
const exchange = new Exchange(chooseGateway(config.env, config.gateways))

export const makeMarketMakers = () => config.markets.map(each => MarketMaker.fromConfig(exchange, each))
