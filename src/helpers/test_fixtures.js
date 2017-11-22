import Currency from '../domain/Currency'
import Exchange from '../domain/Exchange'
import StubbedGateway from './StubbedGateway'


export const defaultCurrencyPair = Currency.pair(Currency.LEV(), Currency.ETH())

export const newExchange = () => new Exchange('test', new StubbedGateway())

export const uuid = () => Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)


