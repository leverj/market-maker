import {Map, Set} from 'immutable'
import ImmutableObject from './ImmutableObject'


export const Maps = {
  vanDiagram(left, right) {
    const keys = Sets.vanDiagram(Set(left.keys()), Set(right.keys()))
    return VanDiagram.of(
      left.filter((v, k) => keys.leftOnly.contains(k)),
      left.merge(right).filter((v, k) => keys.intersection.contains(k)),
      right.filter((v, k) => keys.rightOnly.contains(k))
    )
  }
}

export const Sets = {
  vanDiagram(left, right) {
    const intersection = left.intersect(right)
    return VanDiagram.of(left.subtract(intersection), intersection, right.subtract(intersection))
  }
}

export class VanDiagram extends ImmutableObject {
  static of(leftOnly, intersection, rightOnly) {
    return new VanDiagram(Map({
      leftOnly: leftOnly,
      intersection: intersection,
      rightOnly: rightOnly,
    }))
  }

  constructor(map) { super(map) }
  get leftOnly() { return this.get('leftOnly') }
  get intersection() { return this.get('intersection') }
  get rightOnly() { return this.get('rightOnly') }

  flatMap(mapper) { return new VanDiagram(this.map.map(mapper)) }
}