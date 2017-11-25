import {List, Map, Set} from 'immutable'
import {Maps, Sets, VanDiagram} from './van_diagrams'


describe('Sets', () => {
  describe('vanDiagram', () => {
    it('should discern a van diagram from two sets', () => {
      const left = Set([2, 3, 4, 5, 6]), right = Set([8, 7, 6, 5, 4])
      const vanDiagram = Sets.vanDiagram(left, right)
      vanDiagram.map.map((v, k) => k.size)

      expect(vanDiagram.leftOnly.equals(Set([2, 3,])))
      expect(vanDiagram.intersection.equals(Set([4, 5, 6])))
      expect(vanDiagram.rightOnly.equals(Set([8, 7])))

    })
  })
})


describe('Maps', () => {
  describe('vanDiagram', () => {
    it('should discern a van diagram from two maps', () => {
      const left = Map({one: 1, two: 2, three: 3}), right = Map({three: 3, four: 4, five: 5})
      const vanDiagram = Maps.vanDiagram(left, right)
      expect(vanDiagram.leftOnly.equals(Map({one: 1, two: 2})))
      expect(vanDiagram.intersection.equals(Map({three: 3})))
      expect(vanDiagram.rightOnly.equals(Map({four: 4, five: 5})))
    })
  })
})


describe('VanDiagram', () => {
  describe('flatMap (should map over its 3 parts: leftOnly, intersection, rightOnly', () => {
    it('should map over sets', () => {
      const left = Set([1, 2, 3]), right = Set([3, 4, 5])
      const vanDiagram = Sets.vanDiagram(left, right).flatMap(v => v.size)
      expect(vanDiagram.leftOnly).toBe(2)
      expect(vanDiagram.intersection).toBe(1)
      expect(vanDiagram.rightOnly).toBe(2)
    })
    it('should map over maps', () => {
      const left = Map({one: 1, two: 2, three: 3}), right = Map({three: 3, four: 4, five: 5})
      const vanDiagram = Maps.vanDiagram(left, right).flatMap(v => v.size)
      expect(vanDiagram.leftOnly).toBe(2)
      expect(vanDiagram.intersection).toBe(1)
      expect(vanDiagram.rightOnly).toBe(2)
    })
    it('should map over maps with a more sophisticated conversion', () => {
      const left = Map({one: 1, two: 2, three: 3}), right = Map({three: 3, four: 4, five: 5})
      const vanDiagram = Maps.vanDiagram(left, right).flatMap(v => List(v.keys()).join('-'))
      expect(vanDiagram.leftOnly).toEqual('one-two')
      expect(vanDiagram.intersection).toEqual('three')
      expect(vanDiagram.rightOnly).toEqual('four-five')
    })
  })
})
