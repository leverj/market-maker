import config from 'config'
import {List} from 'immutable'
import StubbedGateway from './common/test_helpers/StubbedGateway'
import Exchange from './domain/Exchange'
import MarketMaker from './domain/MarketMaker'
import Gatecoin from './gateways/Gatecoin'


const gateways = config.get('gateways')
const chooseGateway = (env) => {
  switch (env) {
    case 'test': return new StubbedGateway()
    case 'dev': return new StubbedGateway()
    case 'stage': return Gatecoin.from(gateways)
    case 'production': return Gatecoin.from(gateways)
    default: throw new Error(`unrecognized environment: ${env}`)
  }
}
const exchange = new Exchange(chooseGateway(process.env.NODE_ENV, gateways))
export const markets = List(config.get('markets'))
export const makeMarketMakers = () => markets.map(each => MarketMaker.fromConfig(exchange, each))
