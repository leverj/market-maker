import {fromJS} from 'immutable'
import OrderBook from '../../domain/OrderBook'
import Currency from '../../domain/Currency'
import Exchange from '../../domain/Exchange'
import SpreadStrategy from '../../domain/SpreadStrategy'
import MarketMaker from '../../domain/MarketMaker'
import StubbedGateway from './StubbedGateway'


export const currencies = Currency.pairOf('LEV', 'ETH')
export const emptyBook = OrderBook.of(currencies)
export const newExchange = (gateway = new StubbedGateway()) => new Exchange(gateway)
export const spread = SpreadStrategy.fixed(3, 1, 0.1)
export const marketMaker = () => MarketMaker.of(newExchange(), spread, emptyBook)
// export const marketMaker = async () => await MarketMaker.of(newExchange(), spread, emptyBook).synchronized()

export const toBookMap = (book) => fromJS({ book: book.map })
