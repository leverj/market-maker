## stories
- discrepancy report when MarketMaker is synchronized
- gateway onTrade subscriber/notifier
- functional MarketMaker
- timed-out gateway rest calls

## build
- CircleCI integration 
  - docker image
  - .circle.... file
- github build badges integration

## production
- proper logging (into file, with levels)
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