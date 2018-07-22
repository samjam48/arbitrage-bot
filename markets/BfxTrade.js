const BFX = require('bitfinex-api-node');

const API_URL = 'https://api.bitfinex.com';
const { BITFINEX_API_KEY, BITFINEX_API_SECRET } = require("../keys");


// API_KEY = "YUVYbh5aEetw6lOhDgRp6c7f0299fglUQyB7bf8kcjV";
// API_SECRET = "nmIQxt8xpVEpLbk4LyiixCldE1taX67HvBMSl9xgzgb";
const bfx = new BFX({
    apiKey: BITFINEX_API_KEY,
    apiSecret: BITFINEX_API_SECRET,
    url: API_URL,
    ws: {
        autoReconnect: true,
        seqAudit: true,
        packetWDDelay: 10 * 1000
    }
});

const ws = bfx.ws();
// const rest = bfx.rest(2);
const rest = bfx.rest(1);

ws.on('error', console.error);

BfxTrade = {
    pairs: [],
    orderbook: {},

    initPairs: function(pairsArray) {
        this.pairs = pairsArray;
        for (pair of pairsArray) {
            this.orderbook[pair] = {
                'bids': {
                    'price': 0,
                    'amount': 0
                },
                'asks': {
                    'price': 0,
                    'amount': 0
                }
            }
        }

        ws.on('open', () => {
            for (pair of pairsArray) {
                ws.subscribeOrderBook(pair, 'P0', '1')
            }
        })
        ws.open();
    },

    getOrders: function() {
        var self = this
        ws.on('orderbook', (pair, book) => {

            // if two dimensional array take the first array
            if (book[0].constructor === Array) book = book[0]

            if ( book[2]>0 ) {
                self.orderbook[pair.substring(1)]['bids']['price']  = book[0]
                self.orderbook[pair.substring(1)]['bids']['amount'] = book[2]
            } else {
                self.orderbook[pair.substring(1)]['asks']['price']  = book[0]
                self.orderbook[pair.substring(1)]['asks']['amount'] = book[2] * -1
            }
            // console.log(self.orderbook);

        })
    },

    getBalance: function (callback) {
        // console.log('rest', rest, "bfx", bfx)
        // bfx.rest(1).wallet_balances((err, data) => {
        rest.wallet_balances((err, data) => {
            console.log('bitfx balance', data);
            if (err) {
                console.log(err.toString());
            } else {
                return callback(data)
            }
        })
    },

    // min order size much larger on Bitfinex than on Poloniex
    // not implemented for poloniex as not needed
    getMinOrderSize: function(callback) {
        var self = this;
        rest.symbols_details((err, data) => {
            if (err) {
                console.log(err.toString());
            } else {
                let res = {}
                for (pair of self.pairs) {
                    for (elem of data) {
                        if(elem["pair"] === pair.toLowerCase()) {
                            res[pair] = parseFloat(elem["minimum_order_size"])
                        }
                    }
                }
                return callback(res)
            }
        })
    },

    trade: function (pair, price, callback) {
        var self = this;
        console.log(pair, 'entering into trade');
        rest.new_order(pair, amount.toString(), price.toString(), 'bitfinex', self.mode, 'exchange limit', (err, data) => {
            if (err) {
                console.log(err.toString());
            } else {
                console.log(pair, 'Order was succesfully placed on Bitfinex. Price ', price, ' amount ', amount, ' side ', self.mode);
                setTimeout(() => {
                    checkOrder(pair, data.id, () => {
                        callback()
                    })
                }, 2000);
            }
        })
    },

    checkOrder: function(pair, orderId, callback) {
        if(!orderId || orderId === 0) {
            console.log(pair, ' Bitfinex order was closed immediately');
            callback()
        } else {
            rest.active_orders((err, data) => {
                if (err) {
                    console.log(err.toString());
                } else {
                    let activeorders = []
                    for (order of data) {
                        activeorders.push(order.id.toString())
                    }
                    if (activeorders.indexOf(orderId.toString()) > -1) {
                        setTimeout(() => {
                            checkOrder(pair, orderId, callback)
                        }, 2000);
                    } else {
                        console.log('Bitfinex order was closed');
                        callback()                        
                    }
                }
            })
        }
    }
}

module.exports = BfxTrade