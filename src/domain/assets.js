export class Asset {
  static LEV() { return new Asset("LEV") }
  static ETH() { return new Asset("ETH") }

  static pair(primary, secondary) { return new AssetPair(primary, secondary) }

  constructor(name) {
    this._name = name
  }

  get name() { return this._name }

  toString() { return this.name }
}


class AssetPair {
  constructor(primary, secondary) {
    this._primary = primary
    this._secondary = secondary
  }

  get primary() { return this._primary }
  get secondary() { return this._secondary }

  toString() { return `${this.primary}<->${this.secondary}` }
}


