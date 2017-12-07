import {configure} from './common/globals'
import StubbedGateway from './common/test_helpers/StubbedGateway'
import Exchange from './domain/Exchange'
import MarketMaker from './domain/MarketMaker'
import Gatecoin from './gateways/Gatecoin'


const config = configure('application.json')
const chooseGateway = (env) => {
  switch (env) {
    case 'dev': return new StubbedGateway()
    case 'staging': return Gatecoin.from(config.Gatecoin)
    case 'production': return Gatecoin.from(config.Gatecoin) //fixme: using this for production
    default: throw new Error(`unrecognized environment parameter: ${env}`)
  }
}
const exchange = new Exchange(chooseGateway(config.env, config.gateways))

export const makeMarketMakers = () => config.markets.map(each => MarketMaker.fromConfig(exchange, each))
