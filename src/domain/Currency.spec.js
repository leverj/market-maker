import {Map} from 'immutable'
import Currency from './Currency'


describe('Currency', () => {
  it('should construct from symbol', () => {
    expect(Currency.of('LEV').toJS()).toEqual({symbol: 'LEV'})
    expect(Currency.of('whatever').toJS()).toEqual({symbol: 'whatever'})
    expect(new Currency(Map({symbol: 'whatever'})).toJS()).toEqual({symbol: 'whatever'})
  })

  it('should lazyly construct if non exist', () => {
    const symbol = 'CRAP_' + +new Date()
    expect(Currency.of(symbol).symbol).toEqual(symbol)
  })
})
