import {Map} from 'immutable'
import {actions} from './actions'


export default function reducer(state = Map(), action) {
  switch (action.type) {
    case 'SET_BOOK': return actions.setBook(state, action.book)
    case 'NEXT_TRADE': return actions.nextTrade(state, action.marketMaker, action.trade)
    case 'SYNCHRONIZE_WITH_EXCHANGE': return actions.synchronizeWithExchange(state, action.marketMaker)
    default: return state
  }
}