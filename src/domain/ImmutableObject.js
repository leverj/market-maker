
export default class ImmutableObject {
  constructor(map) { this.map = map }
  equals(that) { return this.map.equals(that.map) }
  hashCode() { return this.map.hashCode() }
  get(key) { return this.map.get(key) }
  getIn(path) { return this.map.getIn(path) }
  hasIn(path) { return this.map.hasIn(path) }
  toJS() { return this.map.toJS() }
  toJSON() { return this.map.toJSON() }
}

