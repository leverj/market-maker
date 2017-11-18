#Glossary

###Exchange
- an external Currency trading exchange which maintains OrderBooks for CurrencyPairs
- has trading accounts for a MarketMaker, which hold Currency reserves
- accepts buy/sell orders by a MarketMaker
- accepts order modifications (cancel, update quantity) by a MarketMaker for existing orders 
- notifies MarketMaker on trades (partial or full matches) against MarketMaker's orders

###MarketMaker
- focuses on maintaining an active market for primary Currency (LEV) trading of a specific CurrencyPair
- has accounts in a Exchange with reserves in both currencies of an CurrencyPair 
- uses a configurable strategy to maintain a spread in an OrderBook
- trades in a specific OrderBook through a Exchange (creates and cancels buy/sell orders)

###OrderBook
- has a specific CurrencyPair
- reflects an external order-book in a Exchange (acts as a proxy)
- holds the set of buy/sell orders representing the a MarketMaker's desired spread
- updates existing orders (internally) based on notifications of order fulfillment by a Exchange
- maintains the last traded price of the primary Currency (in terms of the secondary Currency, as in: 1.25 ETH per LEV)

###Order
- a buy or sell (side), in terms of an CurrencyPair
- specified as a quantity of a primary Currency in terms of the secondary Currency price. Examples:
  - BUY 10 LEV for 0.28 ETH each
  - SELL 200 LEV for 0.22 ETH each

###CurrencyPair
- a fixed pair of primary & secondary Currencys
  - primary: represents the target Currency, for which we want to maintain an active market
  - secondary: represents the traded against Currency, the "currency" of the trades

###Currency
- a crypto currency (ETH or any ERC20 coin)



#Basic functionality (1st cut)

##configuration
* a single Exchange: Getcoin
* a single LEV & ETH CurrencyPair
* using a simple fixed spread of configurable depth D, quantity Q, and price increment PI, the strategy is:
  * place D sell orders (Q quantity each, in PI increments) above last traded price of LEV
  * place D buy orders (Q quantity each, in PI decrements) under last traded price of LEV
  
##mechanics
* place orders for an initial spread (question: what should be the initial exchange rate?)
* ad infinitum, listen to LEV<->ETH trade notifications
* on trade notification:
  * update order in (internal) OrderBook
  * if an order is fulfilled (ie: quantity = 0), shift the spread accordingly (up or down) 
  by a combination of canceling and placing new orders to maintain the intended spread around the **new** last traded price
