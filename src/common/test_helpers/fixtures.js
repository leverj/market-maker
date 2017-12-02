import OrderBook from '../../domain/OrderBook'
import Currency from '../../domain/Currency'
import Exchange from '../../domain/Exchange'
import StubbedGateway from './StubbedGateway'


export const currencies = Currency.pair('LEV', 'ETH')
export const emptyBook = OrderBook.of(currencies)
export const newExchange = (gateway = new StubbedGateway()) => new Exchange(gateway)
