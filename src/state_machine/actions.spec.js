import {List, Map} from 'immutable'
import {actions} from './actions'


describe.skip('application logic', () => {

  describe('set', () => {

    it('adds the book to the state', () => {
      const state = Map()
      const book = List.of('Trainspotting', '28 Days Later')
      const nextState = actions.set(state, book)
      expect(nextState).toEqual(Map({
        book: List.of('Trainspotting', '28 Days Later')
      }))
    })

    it('converts to immutable', () => {
      const state = Map()
      const book = ['Trainspotting', '28 Days Later']
      const nextState = actions.set(state, book)
      expect(nextState).toEqual(Map({
        book: List.of('Trainspotting', '28 Days Later')
      }))
    })

  })

  it('takes the next two book under vote', () => {
    const state = Map({
      book: List.of('Trainspotting', '28 Days Later', 'Sunshine')
    })
    const nextState = actions.next(state)
    expect(nextState).toEqual(Map({
      vote: Map({
        pair: List.of('Trainspotting', '28 Days Later')
      }),
      book: List.of('Sunshine')
    }))

  })

  describe('next', () => {

    it('takes the next two book under vote', () => {
      const state = Map({
        book: List.of('Trainspotting', '28 Days Later', 'Sunshine')
      })
      const nextState = actions.next(state)
      expect(nextState).toEqual(Map({
        vote: Map({
          pair: List.of('Trainspotting', '28 Days Later')
        }),
        book: List.of('Sunshine')
      }))
    })

    it('puts winner of current vote back to book', () => {
      const state = Map({
        vote: Map({
          pair: List.of('Trainspotting', '28 Days Later'),
          tally: Map({
            'Trainspotting': 4,
            '28 Days Later': 2
          })
        }),
        book: List.of('Sunshine', 'Millions', '127 Hours')
      })
      const nextState = actions.next(state)
      expect(nextState).toEqual(Map({
        vote: Map({
          pair: List.of('Sunshine', 'Millions')
        }),
        book: List.of('127 Hours', 'Trainspotting')
      }))
    })

    it('puts both from tied vote back to book', () => {
      const state = Map({
        vote: Map({
          pair: List.of('Trainspotting', '28 Days Later'),
          tally: Map({
            'Trainspotting': 3,
            '28 Days Later': 3
          })
        }),
        book: List.of('Sunshine', 'Millions', '127 Hours')
      })
      const nextState = actions.next(state)
      expect(nextState).toEqual(Map({
        vote: Map({
          pair: List.of('Sunshine', 'Millions')
        }),
        book: List.of('127 Hours', 'Trainspotting', '28 Days Later')
      }))
    })

    it('marks winner when just one entry left', () => {
      const state = Map({
        vote: Map({
          pair: List.of('Trainspotting', '28 Days Later'),
          tally: Map({
            'Trainspotting': 4,
            '28 Days Later': 2
          })
        }),
        book: List()
      })
      const nextState = actions.next(state)
      expect(nextState).toEqual(Map({
        winner: 'Trainspotting'
      }))
    })

  })


  describe('vote', () => {

    it('creates a tally for the voted entry', () => {
      const state = Map({
        pair: List.of('Trainspotting', '28 Days Later')
      })
      const nextState = vote(state, 'Trainspotting')
      expect(nextState).toEqual(Map({
        pair: List.of('Trainspotting', '28 Days Later'),
        tally: Map({
          'Trainspotting': 1
        })
      }))
    })

    it('adds to existing tally for the voted entry', () => {
      const state = Map({
        pair: List.of('Trainspotting', '28 Days Later'),
        tally: Map({
          'Trainspotting': 3,
          '28 Days Later': 2
        })
      })
      const nextState = vote(state, 'Trainspotting')
      expect(nextState).toEqual(Map({
        pair: List.of('Trainspotting', '28 Days Later'),
        tally: Map({
          'Trainspotting': 4,
          '28 Days Later': 2
        })
      }))
    })

  })

})