import config from 'config'
import {List} from 'immutable'
import StubbedGateway from './common/test_helpers/StubbedGateway'
import Exchange from './domain/Exchange'
import MarketMaker from './domain/MarketMaker'
import Gatecoin from './gateways/Gatecoin'


const chooseGateway = () => {
  const gateways = config.get('gateways')
  const env = process.env.NODE_ENV
  switch (env) {
    case 'test': return new StubbedGateway()
    case 'stage': return Gatecoin.from(gateways)
    case 'production': return Gatecoin.from(gateways)
    default: throw new Error(`unaccounted for environment: ${env}`)
  }
}
const makeExchange = () => new Exchange(chooseGateway())
export const makeMarketMakers = () => List(config.get('markets')).map(each => MarketMaker.fromConfig(makeExchange(), each))
