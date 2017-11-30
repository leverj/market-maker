/**
 * needless to say, I am immutable ...
 *
 * all my subclasses are composed of a single Immutable.Map.
 * subclasses provide convenience getters, and of course, no setters:
 * any modification is a T(Map) -> T(Map) transformation.
 */
export default class ImmutableObject {
  constructor(map) { this.map = map }
  equals(that) { return this.map.equals(that.map) }
  hashCode() { return this.map.hashCode() }
  get(key) { return this.map.get(key) }
  getIn(path) { return this.map.getIn(path, undefined) }
  hasIn(path) { return this.map.hasIn(path) }
  toJS() { return this.map.toJS() }
  toJSON() { return this.map.toJSON() }
}

