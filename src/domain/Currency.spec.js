import {Map} from 'immutable'
import Currency from './Currency'


describe('Currency', () => {

  describe('Currency construction', () => {
    it('a new order has no id, and therefore is not placed yet', () => {
      expect(Currency.LEV().toJS()).toEqual({symbol: 'LEV'})
      expect(Currency.from('whatever').toJS()).toEqual({symbol: 'whatever'})
      expect(new Currency(Map({symbol: 'whatever'})).toJS()).toEqual({symbol: 'whatever'})
    })
  })

  describe('CurrencyPair construction', () => {
    it('a new order has no id, and therefore is not placed yet', () => {
      expect(Currency.pair(Currency.LEV(), Currency.ETH()).toJS()).toEqual({
        primary: {symbol: 'LEV'},
        secondary: {symbol: 'ETH'},
        code: 'LEVETH',
      })
    })
  })

})
