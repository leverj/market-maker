## stories
- pubnub subscription to trades push notifications


## build
- CircleCI integration 
  - github build badges
  - docker image
  - bake build info (version/hash/tag ...) with build process
  - incorporate source maps


## production
- consider getting rid of:
  - bubble
  - promise.then
- logging configuration using log4js
  - rotating log files 
  - using ELK
- exception handling 
  - go over what to handle and how (warn -> error -> fatal)
- notification for ops 
  - configure and enable via log4js transports: smtp, slack, ... ?
- integrate a monitoring solution
  - rancherOS
  - ps2
  - graphana + prometheus
- Gatecoin
  - production site keys
  - trading account(2) with money (LEV ? ETH)
- npm `start` script not suitable for production (bubble)
 