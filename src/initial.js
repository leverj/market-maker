import config from 'config'
import {List} from 'immutable'
import Exchange from './domain/Exchange'
import MarketMaker from './domain/MarketMaker'
import Gatecoin from './gateways/Gatecoin'


const makeGateway = () => {
  const gateways = config.get('gateways')
  const env = process.env.NODE_ENV
  switch (env) {
    case 'test': return Gatecoin.from(gateways.Gatecoin)
    case 'production': return Gatecoin.from(gateways.Gatecoin)
    default: throw new Error(`unaccounted for environment: ${env}`)
  }
}
const makeExchange = () => new Exchange(makeGateway())
export const makeMarketMakers = () => List(config.get('markets')).map(each => MarketMaker.fromConfig(makeExchange(), each))
