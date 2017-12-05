import Exchange from './domain/Exchange'
import MarketMaker from './domain/MarketMaker'
import StubbedGateway from './common/test_helpers/StubbedGateway'
import Gatecoin from './gateways/Gatecoin'
import {config} from '../config/application.config'


const chooseGateway = (env) => {
  switch (env) {
    case 'dev': return new StubbedGateway()
    case 'staging': return Gatecoin.from(config.Gatecoin_test)
    case 'production': return Gatecoin.from(config.Gatecoin) //fixme: using this for production
  }
  throw new Error(`unrecognized environment parameter: ${env}`)
}
const exchange = new Exchange(chooseGateway(config.env, config.gateways))

export const makeMarketMakers = () => config.markets.map(each => MarketMaker.fromConfig(exchange, each))
