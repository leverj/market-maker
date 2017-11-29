import makeStore from './src/state_machine/store'
import {startServer} from './src/state_machine/server'
import {makeMarketMaker} from './src/initial'


//fixme: how does it all start with node?

export const store = makeStore()
startServer(store)

const marketMaker = makeMarketMaker(store)
marketMaker.synchronize()


