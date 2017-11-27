import makeStore from './src/state_machine/store'
import {startServer} from './src/state_machine/server'
import {types} from './src/state_machine/actions'
import {makeMarketMaker, emptyBook} from './src/initial'


export const store = makeStore()
startServer(store)

const storedBook = store.getState().get('book')
const book = !!storedBook ? storedBook: emptyBook
store.dispatch(types.set(book))

store.dispatch(types.synchronize(makeMarketMaker(book)))
//fixme: do we need to fork it with a timed out promise?
// import * as promise from './src/common/promises'
// promise.withTimeout(2000, types.synchronize(makeMarketMaker(book)), 'initialing Market Maker')
