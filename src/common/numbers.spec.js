import {decimalPlaces, toDecimalPlaces} from './numbers'


describe('numbers', () => {
  describe('decimalPlaces', () => {
    it('gets precision from any number literal', () => {
      expect(decimalPlaces(123)).toBe(0)
      expect(decimalPlaces(123.0)).toBe(0)
      expect(decimalPlaces(123.1)).toBe(1)
      expect(decimalPlaces(123.12345)).toBe(5)
      expect(decimalPlaces(1e3)).toBe(0)
      expect(decimalPlaces(1e-3)).toBe(3)
    })
  })

  describe('toDecimalPlaces', () => {
    it('converts to precision from any number', () => {
      expect(toDecimalPlaces(123.91827, 10)).toBe(123.91827)
      expect(toDecimalPlaces(123.91827, 5)).toBe(123.91827)
      expect(toDecimalPlaces(123.91827, 3)).toBe(123.918)
      expect(toDecimalPlaces(123.91827, 2)).toBe(123.92)
      expect(toDecimalPlaces(123.91827, 1)).toBe(123.9)
      expect(toDecimalPlaces(123.91827, 0)).toBe(124)
    })
  })

})
