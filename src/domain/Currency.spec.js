import {Map} from 'immutable'
import Currency from './Currency'


describe('Currency', () => {

  describe('Currency construction', () => {
    it('a new order has no id, and therefore is not placed yet', () => {
      expect(Currency.of('LEV').toJS()).toEqual({symbol: 'LEV'})
      expect(Currency.of('whatever').toJS()).toEqual({symbol: 'whatever'})
      expect(new Currency(Map({symbol: 'whatever'})).toJS()).toEqual({symbol: 'whatever'})
    })

    it('should lazyly types a currency if it does not exists', () => {
      const symbol = 'CRAP_'+ +new Date()
      expect(Currency.of(symbol).symbol).toEqual(symbol)
    })
  })

  describe('CurrencyPair construction', () => {
    it('a new order has no id, and therefore is not placed yet', () => {
      expect(Currency.pair(Currency.of('LEV'), Currency.of('ETH')).toJS()).toEqual({
        primary: {symbol: 'LEV'},
        secondary: {symbol: 'ETH'},
        code: 'LEVETH',
      })
      expect(Currency.pairOf('LEV', 'ETH').toJS()).toEqual({
        primary: {symbol: 'LEV'},
        secondary: {symbol: 'ETH'},
        code: 'LEVETH',
      })
      expect(Currency.pairOf('LEV', 'ETH').toString()).toEqual('LEV->ETH')
    })
  })

})
