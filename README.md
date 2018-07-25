# Arbitrage Crypto Bot

## Running

#### Launch
Place your API keys into the keys file
`$ node app.js`

#### Arbitrage Settings
Around line 63 of app.js the app checks that the arbitrage is more than 1.005 to ensure fee's are covered. There is no arbitrage opportunities on current coin pairs on current exchanges so if you run app as it it you never see anything.
Change 1.005 to seomething smaller e.g. 1.0001 and then you can see stuff happening.

#### Timeout settings
The bot has 60 sec wait on start up whilst it acrues all info from exchanges. You can reduce this to stop waiting for so long during testing.

## Trading Manually

The bot must not be live trading on an account you are also trading manually on or things can fuck up!


## Min Order Size

Bitfinex has much larger min order size than poloniex. So a min order size function ahs not been implemented for Poloniex.
Min order size should be implemented for every exchange regardless to ensure and changes or dif exchange pairs never have an error.


### To do's
- refactor to be modular
- Bugs:
    - Regularly get connection error on start
    - Often get wierd 'Invalid pair' error messages for unknown reason
- Position Manager
    - Perform rounding of trade amount
    - How to handle where the trade amount equals limit
    - Handle min order size in poloniex
- test trades
    - make any trade
    - Check trade is executed
         - We use limit order which guarantee's price but not if it get's executed.
         - We just make the order and check if it was processed or if it sits in queue.
- Bfx account values all fake, add actual currency to account and use real data
- Rebalancing assets across exchanges
    - perform checks of balances in dif exchanges
    - move money around when things are getting low so trading can continue
