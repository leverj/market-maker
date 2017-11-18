import makeStore from './src/tutorial/store'
import {startServer} from './src/tutorial/server'

export const store = makeStore()
startServer(store)

store.dispatch({
  type: 'SET_ENTRIES',
  entries: require('./entries.json')
})
store.dispatch({type: 'NEXT'})