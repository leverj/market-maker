import PubNub from 'pubnub'


export default class TradeSubscriber {
  constructor(name, exceptionHandler, channels) {
    this.name = name
    this.exceptionHandler = exceptionHandler
  }

  subscribe() { throw new TypeError('Must override method') }
  unsubscribe() { throw new TypeError('Must override method') }
}

// const OrderBookData = (currencies) => `marketdepth.${currencies.code}`
// const OrderData = (currencies) => `order.${currencies.code}`
// const TradesData = (currencies) => `trade.${currencies.code}`
// const Ticker24hData = (currencies) => `ticker_24h.${currencies.code}`
// const HistTickerhData = (currencies) => `hist_ticker.${currencies.code}`

export class GatecoinPubNubSubscriber extends TradeSubscriber {
  constructor(name, exceptionHandler, config, currencies) {
    super(name, exceptionHandler)
    this.pubnub = new PubNub({ subscribeKey: config.subscribeKey })
    this.channels = [`trade.${currencies.code}`]
    subscribe()
  }

  subscribe() {
    this.pubnub.subscribe({channels: this.channels})
    this.listener = this.pubnub.addListener({
      message: function (message) {
        //fixme: do your thing
      }
    })
  }

  unsubscribe() {
    this.pubnub.removeListener(this.listener)
    this.pubnub.unsubscribe({channels: this.channels})
  }

}


/////////////////////////////////////////////////////////////////////////////////////////////////////////
/******** ADDING LISTENERS ********/

pubnub.addListener({
  message: function(m) {
    // handle message
    var actualChannel = m.actualChannel;
    var channelName = m.channel; // The channel for which the message belongs
    var msg = m.message; // The Payload
    var publisher = m.publisher;
    var subscribedChannel = m.subscribedChannel;
    var channelGroup = m.subscription; // The channel group or wildcard subscription match (if exists)
    var pubTT = m.timetoken; // Publish timetoken
  },
  presence: function(p) {
    // handle presence
    var action = p.action; // Can be join, leave, state-change or timeout
    var channelName = p.channel; // The channel for which the message belongs
    var channelGroup = p.subscription; //  The channel group or wildcard subscription match (if exists)
    var presenceEventTime = p.timestamp; // Presence event timetoken
    var status = p.status; // 200
    var message = p.message; // OK
    var service = p.service; // service
    var uuids = p.uuids;  // UUIDs of users who are connected with the channel with their state
    var occupancy = p.occupancy; // No. of users connected with the channel
  },
  status: function(s) {
    // handle status
    var category = s.category; // PNConnectedCategory
    var operation = s.operation; // PNSubscribeOperation
    var affectedChannels = s.affectedChannels; // The channels affected in the operation, of type array.
    var subscribedChannels = s.subscribedChannels; // All the current subscribed channels, of type array.
    var affectedChannelGroups = s.affectedChannelGroups; // The channel groups affected in the operation, of type array.
    var lastTimetoken = s.lastTimetoken; // The last timetoken used in the subscribe request, of type long.
    var currentTimetoken = s.currentTimetoken; // The current timetoken fetched in the subscribe response, which is going to be used in the next request, of type long.
  }
});



/******** LISTENERS CATEGORIES ********/
/*
   Categories	Description
   PNNetworkUpCategory -> SDK detected that network is online.
   PNNetworkDownCategory -> SDK detected that network is down.
   PNNetworkIssuesCategory -> A subscribe event experienced an exception when running.
   PNReconnectedCategory -> SDK was able to reconnect to pubnub.
   PNConnectedCategory -> SDK subscribed with a new mix of channels (fired every time the channel / channel group mix changed).
   PNAccessDeniedCategory -> PAM permission failure.
   PNMalformedResponseCategory -> JSON parsing crashed.
   PNBadRequestCategory -> Server rejected the request.
   PNDecryptionErrorCategory -> If using decryption strategies and the decryption fails.
   PNTimeoutCategory -> Failure to establish connection due to timeout.
 */



/******** TIME ********/

// Call time() to verify the client connectivity to the origin:

pubnub.time(function(status, response) {
  if (status.error) {
    // handle error if something went wrong based on the status object
  } else {
    console.log(response.timetoken);
  }
})

