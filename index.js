import makeStore from './src/state_machine/store'
import {startServer} from './src/state_machine/server'
import {types} from './src/state_machine/actions'
import {makeMarketMaker, emptyBook} from './src/initial'
import {withTimeout} from './src/common/promises'


export const store = makeStore()
startServer(store)

withTimeout(3000, makeMarketMaker(emptyBook).synchronized(), 'initialing Market Maker')



/*** ignore the following for now ***/
/*
const storedBook = store.getState().get('book')
const book = !!storedBook ? storedBook: emptyBook
store.dispatch(types.setBook(book))

store.dispatch(types.synchronizeWithExchange(makeMarketMaker(book)))
//fixme: do we need to fork it with a timed out promise?
// import * as promise from './src/common/promises'
// promises.withTimeout(2000, types.synchronizeWithExchange(makeMarketMaker(book)), 'initialing Market Maker')
*/