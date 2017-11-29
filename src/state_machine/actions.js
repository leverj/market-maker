import OrderBook from '../domain/OrderBook'
import {print} from '../common/test_helpers/utils'


export const actionTypes = {
  setBook: (book) => { return {type: 'SET_BOOK', book: book} },
  nextTrade: (marketMaker, trade) => { return {type: 'NEXT_TRADE', marketMaker: marketMaker, trade: trade} },
  synchronizeWithExchange: (marketMaker) => { return {type: 'SYNCHRONIZE_WITH_EXCHANGE', marketMaker: marketMaker} },
}


export const actions = {
  setBook: (state, book) => setBookInState(state, book),

  nextTrade: async (state, marketMaker, trade) => {
    const currentBook = getBookFromState(state)
    const nextBook = await marketMaker.respondTo(trade, currentBook)
    // print(trade.id)
    // print(currentBook.map.getIn(['orders', trade.id, "remaining"]))
    // // print(nextBook.map.getIn(['orders', trade.id, "remaining"]))
    // print(nextBook)
    return setBookInState(state, nextBook)
  },

  synchronizeWithExchange: async (state, marketMaker) => {
    const book = await marketMaker.synchronize()
    return setBookInState(state, book)
  }
}
const getBookFromState = (state) => new OrderBook(state.get('book'))
const setBookInState = (state, book) => state.set('book', book.map)


