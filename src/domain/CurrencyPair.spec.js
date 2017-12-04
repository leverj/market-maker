import CurrencyPair from './CurrencyPair'


describe('CurrencyPair', () => {
  it('should construct from symbols', () => {
    expect(CurrencyPair.of('LEV', 'ETH').toJS()).toEqual({
      primary: {symbol: 'LEV'},
      secondary: {symbol: 'ETH'},
      code: 'LEVETH',
    })
    expect(CurrencyPair.of('LEV', 'ETH').toString()).toEqual('LEV->ETH')
  })

  it('should construct from config', () => {
    expect(CurrencyPair.fromConfig({primary: 'LEV', secondary: 'ETH'})).toBe(CurrencyPair.of('LEV', 'ETH'))
  })

  it('should lazyly construct if non exist', () => {
    expect(CurrencyPair.get('SourceTarget')).toBeUndefined()
    expect(CurrencyPair.of('Source', 'Target').toString()).toEqual('Source->Target')
    expect(CurrencyPair.get('SourceTarget')).toBeDefined()
    expect(CurrencyPair.get('SourceTarget')).toBe(CurrencyPair.of('Source', 'Target'))
  })
})
