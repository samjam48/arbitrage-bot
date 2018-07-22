// import { bfxTrade } from './markets/BfxTrade';
// const bfxTrade = require('./markets/BfxTrade')
// const poloTrade = require('./markets/PoloTrade')
const balance = require('./markets/Balance');
const exchanges = [require('./markets/BfxTrade'), require('./markets/PoloTrade')];

const bfxPairs = ['ETHBTC', 'XRPBTC', 'LTCBTC', 'XMRBTC', 'EOSBTC', 'BCHBTC', 'NEOBTC', 'OMGBTC', 'DSHBTC', 'ETCBTC'];
const poloPairs = ['BTC_ETH', 'BTC_XRP', 'BTC_LTC', 'BTC_XMR', 'BTC_EOS', 'BTC_BCH', 'BTC_NEO', 'BTC_OMG', 'BTC_DSH', 'BTC_ETC'];

// exchanges[0].initPairs(bfxPairs)

// exchanges[0].getOrders()

// console.log(exchanges[0].orderbook);

// process.exit();

// exchanges[1].initPairs(poloPairs)

// exchanges[1].getOrders()

// console.log(exchanges[1].orderbook);


var bids = [], asks = [];
var maxBid = 0, minAsk = 0;
var bidExchange = -1, askExchange = -1;
var limits = {};

exchanges[0].initPairs(bfxPairs);
exchanges[1].initPairs(poloPairs);

exchanges[0].getMinOrderSize((data) => {
    limits = data;
});

for (exchange of exchanges) {
    exchange.getOrders()
}

var self = this

// NOTE - update at start as can take 2 secs to update and add latency
// update again after trade to minAskimise latency
// do not use same account for manual trades when bot is live!
balance.updateBalance(() => {
    setTimeout(() => {
        console.log('started');
        setInterval(function(){
            compare(self)
        }, 50)
        // console.log('bitfinex', exchanges[0].orderbook);
        // console.log('poloniex', exchanges[1].orderbook);
    }, 6000);
})


// data analyzer
function compare(self){
    for (bfxKey in exchanges[0].orderbook) {

        for (poloKey in exchanges[1].orderbook) {
            if(matchKeys(bfxKey, poloKey)) {
                bids.push(exchanges[0].orderbook[bfxKey]['bids']['price'])
                bids.push(exchanges[1].orderbook[poloKey]['bids']['price'])
                asks.push(exchanges[0].orderbook[bfxKey]['asks']['price'])
                asks.push(exchanges[1].orderbook[poloKey]['asks']['price'])

                // console.log('Pre Math calc - pairname', bfxKey, poloKey, 'bids', bids, 'asks', asks);

                maxBid = Math.max.apply(Math, bids)
                minAsk = Math.min.apply(Math, asks)
                // console.log('pairname', bfxKey, poloKey, 'bids', maxBid, 'asks', minAsk);

                // combined fees 0.4% so we check for 0.5% profit to ensure we don't lose money
                if(maxBid>0 && minAsk>0){
                // if(maxBid>0 && minAsk>0 && maxBid>minAsk*1.005){
                    bidExchange = bids.indexOf(maxBid)
                    askExchange = asks.indexOf(minAsk)

                    console.log("bidExchange", bidExchange, askExchange);


                    // check bid and ask are on different exchanges
                    if (bidExchange !== askExchange) {
                        console.log(bidExchange, askExchange);

                        exchanges[askExchange].mode = 'buy'
                        exchanges[bidExchange].mode = 'sell'

                        var buyPair     = bidExchange = 0 ? poloKey : bfxKey ;
                        var sellPair    = bidExchange = 0 ?  bfxKey : poloKey ;

                        var buyBalance  = balance.getBalance(askExchange, buyPair, exchanges[askExchange].mode)
                        var sellBalance = balance.getBalance(bidExchange, sellPair, exchanges[bidExchange].mode)

                        var tradeAmount = Math.min( exchanges[bidExchange].orderbook.sellPair['bids']['amount'],
                                                    exchanges[askExchange].orderbook.buyPair['asks']['amount'] )
                        var limitBalance = Math.min(sellBalance, buyBalance / minAsk)

                        console.log('trade amount', tradeAmount);
                        console.log('limit Balance', limitBalance);

                        // if(tradeAmount == limitBalance) {
                        //     tradeAmount = limitBalance
                        // }

                        var pairLimit = 0
                        for( key in limits) {
                            if ( buyPair.includes(key) ) {
                                pairLimits = limits[key]
                            } 
                        }

                        if (tradeAmount < pairLimit) {
                            tradeAmount = pairLimit
                        }

                        if (sellBalance >= tradeAmount && buyBalance >= tradeAmount.min) {
                            console.log('pairname', bfxKey, ' sell on', bidExchange, ' price', maxBid, ' buy on', askExchange, ' price', minAsk);

                            // complete callback function to create order of ledgers.
                            // block bot operations until callback success recieved
                            // return bot to normal function once complete
                            // exchanges[bidExchange].trade(sellPair, maxBid, tradeAmount, () => {

                            // })

                            // exchanges[askExchange].trade(buyPair, minAsk, tradeAmount, () => {

                            // })
                        }
                    }
                }
                bids.length = 0
                asks.length = 0
                maxBid = 0
                minAsk = 0
            }
        }
    }
}

function matchKeys (key1, key2) {
    return key1.includes(key2.split('_')[1]) ? true : false ;
}
