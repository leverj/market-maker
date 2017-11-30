## stories
- pubnub subscription to trades push notifications
- funnel respondTo(trade) callbacks via queue
- lock respondTo(trade) queue processing while synchronizing with exchange
- timed-out gateway rest calls

## build
- CircleCI integration 
  - github build badges
  - bake build info (version/hash/tag ...)
  - docker image

## production
- consider getting rid of:
  - bubble
  - promise.then
- proper logging (with levels, rotating log files and|or using ELK)
  - using something like: bunyan, winston
- notification mechanism for ops (can be incorporated via logging?)
- exception handler (incorporate with logging and/or ops notifications)
- integrate a monitoring solution
  - rancherOS
  - ps2
  - graphana + prometheus
- npm `start` script not suitable for production (bubble)
- Gatecoin
  - production site keys
  - trading account(2) with money (LEV ? ETH)
  