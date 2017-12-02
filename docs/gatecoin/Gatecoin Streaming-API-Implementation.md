# Streaming-API-Implementation


Implementation guide for real time streaming of data over Web Sockets.

Gatecoin uses PubNub libraries for publishing real-time data.
Please visit https://www.pubnub.com/console/ for more details.

This [tutorial](https://www.pubnub.com/developers/tutorials/publish-subscribe/) provides an explanation on how to use pubnub libraries to subsrcibe to desired channels, in multiple prgramming lanugages.

**Subscribe key for all channels:**  sub-c-ee68e350-4ef7-11e6-bfbb-02ee2ddab7fe

### Order book Data

**Channels:**  

```
- marketdepth.BTCEUR
- marketdepth.BTCHKD
- marketdepth.BTCUSD
- marketdepth.ETHBTC
- marketdepth.REPBTC
```

**Sample Response:**

```
[{"asks":[{"p":333.16,"q":1.74},{"p":334.23,"q":0.38},{"p":335.0,"q":25.0},{"p":
335.1,"q":2.36},{"p":336.0,"q":10.0},{"p":336.69,"q":0.63},{"p":337.6,"q":0.1},{
"p":338.0,"q":4.59},{"p":338.6,"q":0.1},{"p":338.8,"q":1.0},{"p":339.6,"q":1.493
},{"p":340.0,"q":6.5},{"p":340.4,"q":1.77},{"p":340.6,"q":0.1},{"p":341.2,"q":0.
108},{"p":341.37,"q":1.57},{"p":341.6,"q":0.013},{"p":342.0,"q":4.5},{"p":342.6,
"q":0.1},{"p":342.8,"q":0.43}],"bids":[{"p":332.93,"q":0.39},{"p":332.0,"q":10.0
},{"p":331.74,"q":3.13},{"p":331.0,"q":25.0},{"p":330.3,"q":0.076},{"p":330.01,"
q":6.0},{"p":330.0,"q":14.978},{"p":329.8,"q":0.7},{"p":329.3,"q":0.1},{"p":329.
03,"q":1.194},{"p":328.3,"q":0.672},{"p":328.0,"q":7.4},{"p":327.5,"q":1.38},{"p
":327.3,"q":0.093},{"p":326.7,"q":0.9},{"p":326.4,"q":0.08},{"p":326.0,"q":5.89}
,{"p":325.9,"q":0.6},{"p":325.5,"q":0.04},{"p":325.1,"q":0.5}],"last":333.16,"ch
annel":"marketdepth.BTCUSD","channelName":"marketdepth.BTCUSD","currency":"USD",
"item":"BTC","stamp":1447916634},"14479166348176458","marketdepth.BTCUSD"]
```

### Ticker Data

**Channels:**

```
- ticker_24h.BTCEUR
- ticker_24h.BTCHKD
- ticker_24h.BTCUSD
- ticker_24h.ETHBTC
- ticker_24h.REPBTC
- hist_ticker.BTCEUR
- hist_ticker.BTCHKD
- hist_ticker.BTCUSD
- hist_ticker.ETHBTC
- hist_ticker.REPBTC
```

**Sample Response:**

```
[{"ticker":{"timeframe":"24h","high":337.2,"low":330.7,"vol":3205.571,"vwap":333
.500413118287,"open":331.1,"last":333.44,"now":1447917201},"channel":"ticker_24h
.BTCUSD","channelName":"ticker_24h.BTCUSD","currency":"USD","item":"BTC","stamp"
:1447917201},"14479172014745348","ticker_24h.BTCUSD"]

```

### Trades Data

**Channels:** 

```
- trade.BTCEUR
- trade.BTCHKD
- trade.BTCUSD
- trade.ETHBTC
- trade.REPBTC

```
**Sample Response"**
```
[{"trade":{"date":1447917364,"tid":8031616,"price":333.1,"amount":1.45},"channel
":"trade.BTCUSD","channelName":"trade.BTCUSD","currency":"USD","item":"BTC","sta
mp":1447917364},"14479173650475411","trade.BTCUSD"]
```

### OrderData

**Channels:** 

```
- order.BTCEUR"
- order.BTCHKD"
- order.BTCUSD"
- order.ETHBTC"
- order.REPBTC"
```

**Sample Response:**

```
[{"order":{"oid":"BK11444375941","code":"BTCUSD","side":0,"price":329.81,"initAm
ount":0.81,"remainAmout":0.81,"status":1},"channel":"order.BTCUSD","channelName"
:"order.BTCUSD","currency":"USD","item":"BTC","stamp":1447916994},"1447916994784
7860","order.BTCUSD"]
```

