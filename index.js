import {makeMarketMakers} from './src/initial'


//fixme: how does it all start with node?

makeMarketMakers().map(each => each.synchronize())


