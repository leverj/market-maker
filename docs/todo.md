## stories
- discrepancy report when MarketMaker is synchronized
- gateway onTrade subscriber/notifier
- timed-out gateway rest calls

## build
- CircleCI integration 
  - docker image
- github build badges integration
- discard babel if not needed 

## production
- proper logging (into file, with levels)
  - using something like: bunyan, winston
- notification mechanism (can be incorporated via logging?)
- proper exception handler
- integrate a monitoring solution
  - rancherOS
  - ps2
  - graphana + prometheus
- npm `start` script not suitable for production
- Gatecoin
  - production site keys
  - trading account(2) with money (ETH ?) in it