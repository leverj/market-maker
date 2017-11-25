import OrderBook from '../domain/OrderBook'


export const actionCreators = {
  set: (book) => { return {type: 'SET', book: book} },
  next: (marketMaker, trade) => { return {type: 'NEXT', marketMaker: marketMaker, trade: trade} },
  synchronize: (marketMaker) => { return {type: 'SYNCHRONIZE', marketMaker: marketMaker} },
}


export const actions = {
  set: (state, book) => state.set('book', book.map),

  next: (state, marketMaker, trade) => {
    const book = new OrderBook(state.get('book'))
    return state.set('book', marketMaker.respondTo(trade, book).map)
  },

  synchronize: (state, marketMaker) => {
    const book = marketMaker.synchronized().book
    return state.set('book', book.map)
  }
}


