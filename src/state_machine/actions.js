import OrderBook from '../domain/OrderBook'


export const types = {
  setBook: (book) => { return {type: 'SET_BOOK', book: book} },
  nextTrade: (marketMaker, trade) => { return {type: 'NEXT_TRADE', marketMaker: marketMaker, trade: trade} },
  synchronizeWithExchange: (marketMaker) => { return {type: 'SYNCHRONIZE_WITH_EXCHANGE', marketMaker: marketMaker} },
}


export const actions = {
  setBook: (state, book) => state.set('book', book.map),

  nextTrade: async (state, marketMaker, trade) => {
    const book = new OrderBook(state.get('book'))
    const nextBook = await marketMaker.respondTo(trade, book)
    return state.set('book', nextBook.map)
  },

  synchronizeWithExchange: async (state, marketMaker) => {
    const book = await marketMaker.synchronized().book
    return state.set('book', book.map)
  }
}


