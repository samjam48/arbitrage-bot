const balance = require('./markets/Balance');
const exchanges = [require('./markets/BfxTrade'), require('./markets/PoloTrade')];

const bfxPairs = ['ETHBTC', 'XRPBTC', 'LTCBTC', 'XMRBTC', 'EOSBTC', 'BCHBTC', 'NEOBTC', 'OMGBTC', 'DSHBTC', 'ETCBTC'];
const poloPairs = ['BTC_ETH', 'BTC_XRP', 'BTC_LTC', 'BTC_XMR', 'BTC_EOS', 'BTC_BCH', 'BTC_NEO', 'BTC_OMG', 'BTC_DSH', 'BTC_ETC'];


var bids = [], asks = [];
var maxBid = 0, minAsk = 0;
var bidExchange = -1, askExchange = -1;
var minOrderLimits = {};

exchanges[0].initPairs(bfxPairs);
exchanges[1].initPairs(poloPairs);

exchanges[0].getMinOrderSize((data) => {
    minOrderLimits = data;

    console.log('min order Limits =', minOrderLimits);
});

for (exchange of exchanges) {
    exchange.getOrders()
}

var self = this

// NOTE - update at start and wait 60 secs as takes time to retrieve all currency prices
// update again after trade to minimise latency
// do not use same account for manual trades when bot is live!
balance.updateBalance(() => {
    console.log('Waiting 60 secs for all data to accrue');

    setTimeout(() => {
        console.log('started');
        setInterval(function(){
            compare(self)
        }, 50)
        // console.log('bitfinex', exchanges[0].orderbook);
        // console.log('poloniex', exchanges[1].orderbook);
    }, 60000);
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
                // if(maxBid>0 && minAsk>0){ // use this during testing just to see what happens
                // if( maxBid > 0 && minAsk > 0 && maxBid > (minAsk * 1.000001 )){  // test value
                if(maxBid>0 && minAsk>0 && maxBid>minAsk*1.005){
                    bidExchange = bids.indexOf(maxBid)
                    askExchange = asks.indexOf(minAsk)

                    // console.log("bidExchange", bidExchange, askExchange);

                    // check bid and ask are on different exchanges
                    if (bidExchange !== askExchange) {
                        console.log(bidExchange, askExchange);

                        exchanges[askExchange].mode = 'buy'
                        exchanges[bidExchange].mode = 'sell'

                        var buyPair     = bidExchange == 0 ? poloKey : bfxKey ;
                        var sellPair    = bidExchange == 0 ?  bfxKey : poloKey ;

                        var buyAccountBalance  = balance.getBalance(askExchange, buyPair, exchanges[askExchange].mode)
                        var sellAccountBalance = balance.getBalance(bidExchange, sellPair, exchanges[bidExchange].mode)

                        var maxTradeableAmount = Math.min( exchanges[bidExchange].orderbook[sellPair]['bids']['amount'],
                                                    exchanges[askExchange].orderbook[buyPair]['asks']['amount'] )
                        var availableAccountBalance = Math.min(sellAccountBalance, buyAccountBalance / minAsk)

                        console.log("buyAccountBalance", buyAccountBalance, "sellAccountBalance", sellAccountBalance);
                        console.log('max bid', maxBid);
                        console.log('min ask', minAsk);
                        console.log('trade amount', maxTradeableAmount);
                        console.log('limit Balance', availableAccountBalance);

                        if(maxTradeableAmount > availableAccountBalance) {
                            maxTradeableAmount = availableAccountBalance
                        }

                        var pairLimit = 0;
                        for( key of Object.keys(minOrderLimits) ) {
                            console.log('key, ', key);
                            console.log('minOrderLimits, ', minOrderLimits);
                            console.log('buy pair, ', buyPair);
                            
                            // TO DO - Convert currency keys to be the sae format
                            if ( buyPair == key ) {
                                pairLimit = minOrderLimits[key]
                                console.log('New pairLimit =', pairLimit);
                            }
                        }
                        console.log('pairLimit =', pairLimit);

                        if (maxTradeableAmount < pairLimit) {
                            console.log("insufficent funds to trade, ", buyPair);
                            console.log("bid exchange, ", sellAccountBalance);
                            console.log("ask exchange, ", buyAccountBalance);

                            continue;
                        }

                        if (sellAccountBalance >= maxTradeableAmount && buyAccountBalance >= maxTradeableAmount.min) {
                            console.log('pairname', bfxKey, ' sell on', bidExchange, ' price', maxBid, ' buy on', askExchange, ' price', minAsk);

                            // complete callback function to create order of ledgers.
                            // block bot operations until callback success recieved
                            // return bot to normal function once complete

                            // exchanges[bidExchange].trade(sellPair, maxBid, maxTradeableAmount, () => {

                            // })

                            // exchanges[askExchange].trade(buyPair, minAsk, maxTradeableAmount, () => {

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



// Make curency pairs same format
function convertPairName(pair){
    // if it contains '_'
    //do stuff
}

