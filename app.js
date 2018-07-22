// import { bfxTrade } from './markets/BfxTrade';
// const bfxTrade = require('./markets/BfxTrade')
// const poloTrade = require('./markets/PoloTrade')
const balance = require('./markets/Balance');
const exchanges = [require('./markets/BfxTrade'), require('./markets/PoloTrade')];

const bfxPairs = ['ETHBTC', 'XRPBTC', 'LTCBTC', 'XMRBTC', 'EOSBTC', 'BCHBTC', 'NEOBTC', 'OMGBTC', 'DSHBTC', 'ETCBTC'];
const poloPairs = ['BTC_ETH', 'BTC_XRP', 'BTC_LTC', 'BTC_XMR', 'BTC_EOS', 'BTC_BCH', 'BTC_NEO', 'BTC_OMG', 'BTCDSH', 'BTC_ETC'];

// bfxTrade.initPairs(bfxPairs)

// bfxTrade.getOrders()

// poloTrade.initPairs(Pairs)

// poloTrade.getOrders()

// console.log(bfxTrade.orderbook);

var bids = [], asks = [];
var max = 0, min = 0;
var bidIndex = -1, askIndex = -1;
var limits = {};

exchanges[0].initPairs(bfxPairs)
exchanges[1].initPairs(poloPairs)

exchanges[0].getMinOrderSize((data) => {
    limits = data;
})

for (exchange of exchanges) {
    exchange.getOrders()
}

var self = this

// NOTE - update at start as can take 2 secs to update and add latency
// update again after trade to minimise latency
// do not use same account for manual trades when bot is live!
balance.updateBalance(() => {
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

                max = Math.max.apply(Math, bids)
                min = Math.min.apply(Math, asks)
                console.log('pairname', bfxKey, poloKey, 'bids', max, 'asks', min);

                // combined fees 0.4% so we check for 0.5% profit to ensure we don't lose money
                if(max>0 && min>0 && max>min*1.005){
                    bidIndex = bids.indexOf(max)
                    askIndex = asks.indexOf(min)
                    console.log(bidIndex, askIndex);

                    // check bid and ask are on different exchagnes
                    if (bidIndex !== askIndex) {
                        exchanges[bidIndex].mode = 'sell'
                        exchanges[askIndex].mode = 'buy'
                        var buyPair     = bidIndex = 0 ? poloKey : bfxKey ;
                        var sellPair    = bidIndex = 0 ?  bfxKey : poloKey ;

                        var buyBalance  = getBalance(askIndex, buyPair, exchanges[askIndex].mode)
                        var sellBalance = getBalance(bidIndex, sellPair, exchanges[sellIndex].mode)

                        var tradeAmount = Math.min( exchanges[bidIndex].orderbook.sellPair['bids']['amount'],
                                                    excahanges[askIndex].orderbook.buyPair['asks']['amount'] )
                        var limitBalance = Math.min(sellBalance, buyBalance / min)

                        if(tradeAmount = limitBalance) {
                            tradeAmount = limitBalance
                        }

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
                            console.log('pairname', bfxKey, ' sell on', bidIndex, ' price', max, ' buy on', askIndex, ' price', min);

                            // complete callback function to create order of ledgers.
                            // block bot operations until callback success recieved
                            // return bot to normal function once complete
                            exchanges[bidIndex].trade(sellPair, max, tradeAmount, () => {

                            })

                            exchanges[askIndex].trade(buyPair, min, tradeAmount, () => {

                            })
                        }
                    }
                }
                bids.length = 0
                asks.length = 0
                max = 0
                min = 0
            }
        }
    }
}

function matchKeys (key1, key2) {
    return key1.includes(key2.split('_')[1]) ? true : false ;
}
