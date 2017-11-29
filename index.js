import * as promises from './src/common/promises'
import makeStore from './src/state_machine/store'
import {startServer} from './src/state_machine/server'
import {makeMarketMaker} from './src/initial'


export const store = makeStore()
const marketMaker = makeMarketMaker(store)
promises.withTimeout(3000, marketMaker.synchronize(), 'initialing Market Maker')

startServer(store)


