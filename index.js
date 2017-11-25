import makeStore from './src/state_machine/store'
import {startServer} from './src/state_machine/server'
import {actionCreators} from './src/state_machine/actions'
import {makeMarketMaker, emptyBook} from './src/initial'


export const store = makeStore()
startServer(store)

store.dispatch(actionCreators.set(emptyBook))

//fixme: this is a promise, but we can't do async await here ... use a callback or a setTimeout instead
makeMarketMaker().
  then(marketMaker => store.dispatch(actionCreators.synchronize(marketMaker)))
