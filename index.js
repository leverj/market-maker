import {makeMarketMaker, emptyBook} from './src/initial'
import * as promises from './src/common/promises'


const marketMaker = makeMarketMaker(emptyBook)
promises.withTimeout(3000, marketMaker.synchronize(), 'initialing Market Maker')
