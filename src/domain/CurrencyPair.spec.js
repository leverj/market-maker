import config from 'config'
import CurrencyPair from './CurrencyPair'


describe('CurrencyPair', () => {
  it('construct from symbols', () => {
    expect(CurrencyPair.of('LEV', 'ETH').toJS()).toEqual({
      primary: {symbol: 'LEV'},
      secondary: {symbol: 'ETH'},
      code: 'LEVETH',
    })
    expect(CurrencyPair.of('LEV', 'ETH').toString()).toEqual('LEV->ETH')
  })

  it('construct from config', () => {
    expect(CurrencyPair.fromConfig({primary: 'LEV', secondary: 'ETH'})).toBe(CurrencyPair.of('LEV', 'ETH'))
  })

  it('construct from config file', () => {
    const conf = config.get('markets')[0].currencies
    expect(CurrencyPair.fromConfig(conf)).toBe(CurrencyPair.of('LEV', 'ETH'))
  })

  it('lazyly construct if non exist', () => {
    expect(CurrencyPair.get('SourceTarget')).toBeUndefined()
    expect(CurrencyPair.of('Source', 'Target').toString()).toEqual('Source->Target')
    expect(CurrencyPair.get('SourceTarget')).toBeDefined()
    expect(CurrencyPair.get('SourceTarget')).toBe(CurrencyPair.of('Source', 'Target'))
  })
})
