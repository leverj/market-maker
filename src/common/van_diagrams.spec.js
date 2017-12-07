import {List, Map, Set} from 'immutable'
import * as matchers from 'jest-immutable-matchers'
import {Lists, Maps, Sets, VanDiagram} from './van_diagrams'


describe('Sets', () => {
  beforeEach(() => jest.addMatchers(matchers) )
  describe('vanDiagram', () => {
    it('discern a van diagram from two sets', () => {
      const left = Set([2, 3, 4, 5, 6]), right = Set([8, 7, 6, 5, 4])
      const vanDiagram = Sets.vanDiagram(left, right)
      expect(vanDiagram.leftOnly).toEqualImmutable(Set([2, 3,]))
      expect(vanDiagram.intersection).toEqualImmutable(Set([4, 5, 6]))
      expect(vanDiagram.rightOnly).toEqualImmutable(Set([8, 7]))
    })
  })
})


describe('Lists', () => {
  beforeEach(() => jest.addMatchers(matchers) )
  describe('vanDiagram', () => {
    it('discern a van diagram from two lists', () => {
      const left = List([2, 2, 3, 4, 5, 6]), right = List([8, 8, 8, 7, 6, 5, 4])
      const vanDiagram = Lists.vanDiagram(left, right)
      expect(vanDiagram.leftOnly.sort()).toEqualImmutable(List([2, 3,]))
      expect(vanDiagram.intersection.sort()).toEqualImmutable(List([4, 5, 6]))
      expect(vanDiagram.rightOnly.sort()).toEqualImmutable(List([7, 8]))
    })
  })
})


describe('Maps', () => {
  beforeEach(() => jest.addMatchers(matchers) )
  describe('vanDiagram', () => {
    it('discern a van diagram from two maps', () => {
      const left = Map({one: 1, two: 2, three: 3}), right = Map({three: 3, four: 4, five: 5})
      const vanDiagram = Maps.vanDiagram(left, right)
      expect(vanDiagram.leftOnly).toEqualImmutable(Map({one: 1, two: 2}))
      expect(vanDiagram.intersection).toEqualImmutable(Map({three: 3}))
      expect(vanDiagram.rightOnly).toEqualImmutable(Map({four: 4, five: 5}))
    })
  })
})


describe('VanDiagram', () => {
  describe('transform (map over its 3 parts: leftOnly, intersection, rightOnly', () => {
    it('map over sets', () => {
      const left = Set([1, 2, 3]), right = Set([3, 4, 5])
      const vanDiagram = Sets.vanDiagram(left, right).transform(v => v.size)
      expect(vanDiagram.leftOnly).toBe(2)
      expect(vanDiagram.intersection).toBe(1)
      expect(vanDiagram.rightOnly).toBe(2)
    })

    it('map over maps', () => {
      const left = Map({one: 1, two: 2, three: 3}), right = Map({three: 3, four: 4, five: 5})
      const vanDiagram = Maps.vanDiagram(left, right).transform(v => v.size)
      expect(vanDiagram.leftOnly).toBe(2)
      expect(vanDiagram.intersection).toBe(1)
      expect(vanDiagram.rightOnly).toBe(2)
    })

    it('map over maps with a more sophisticated conversion', () => {
      const left = Map({one: 1, two: 2, three: 3}), right = Map({three: 3, four: 4, five: 5})
      const vanDiagram = Maps.vanDiagram(left, right).transform(v => List(v.keys()).join('-'))
      expect(vanDiagram.leftOnly).toEqual('one-two')
      expect(vanDiagram.intersection).toEqual('three')
      expect(vanDiagram.rightOnly).toEqual('four-five')
    })
  })
})
