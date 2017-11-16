import {expect} from 'chai'
import {List, Map} from 'immutable'


describe('immutability', () => {

  describe('A List', () => {

    const addMovie = (currentState, movie) => currentState.push(movie)

    it('is immutable', () => {
      const state = List.of('Trainspotting', '28 Days Later')
      const nextState = addMovie(state, 'Sunshine')
      expect(nextState).to.equal(List.of(
        'Trainspotting',
        '28 Days Later',
        'Sunshine'
      ))
      expect(state).to.equal(List.of(
        'Trainspotting',
        '28 Days Later'
      ))
    })

  })

  describe('a tree', () => {

    const addMovie = (currentState, movie) => currentState.update('movies', movies => movies.push(movie))

    it('is immutable', () => {
      const state = Map({
        movies: List.of('Trainspotting', '28 Days Later')
      })
      const nextState = addMovie(state, 'Sunshine')
      expect(nextState).to.equal(Map({
        movies: List.of(
          'Trainspotting',
          '28 Days Later',
          'Sunshine'
        )
      }))
      expect(state).to.equal(Map({
        movies: List.of(
          'Trainspotting',
          '28 Days Later'
        )
      }))
    })

  })

})