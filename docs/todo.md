## stories
- pubnub subscription to trades push notifications


## build
- CircleCI integration 
  - github build badges
  - docker image
  - bake build info (version/hash/tag ...) with build process


## production
- consider getting rid of:
  - promise.then
- logging configuration using log4js
  - ... now using rotating log files. use ELK (logstash)
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
  - trading accounts with LEV & ETH balances
 