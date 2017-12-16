import Decimal from 'decimal.js'

export const toDecimalPlaces = (number, decimals) => Number(new Decimal(number).toDecimalPlaces(decimals))
export const decimalPlaces = (number) => new Decimal(number).decimalPlaces()
export const log10 = (number) => Math.log(number) / Math.LN10