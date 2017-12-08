import {makeMarketMakers} from './initial'

makeMarketMakers().map(each => each.synchronize())


