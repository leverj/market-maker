import {Map} from 'immutable'
import {actions} from './actions'


export default function reducer(state = Map(), action) {
  switch (action.type) {
    case 'SET': return actions.set(state, action.book)
    case 'NEXT': return actions.next(state, action.marketMaker, action.trade)
    case 'SYNCHRONIZE': return actions.synchronize(state, action.marketMaker)
    default: return state
  }

}