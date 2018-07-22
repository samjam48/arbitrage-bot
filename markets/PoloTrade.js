const PoloManager = require('poloniex-orderbook');
const polo = new PoloManager().connect({
    headers: ''
});

const PoloRest = require('./api/poloniex')
const polorest = new PoloRest('API_KEY', 'API_SECRET')

polo.on('error', err => console.log(err));

PoloTrade = {
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
            polo.market(pair);
        }
    },

    getOrders: function() {
        var self = this
        polo.on('change', info => {
            self.orderbook[info['channel']][info['side']]['price'] = parseFloat(info['rate'])
            self.orderbook[info['channel']][info['side']]['amount'] = parseFloat(info['amount'])
        // console.log(self.orderbook);

        })

    },

    getBalance: function(callback) {
        polorest.returnBalances((err, data) => {
            if (err) {
                console.log(err);
            } else {
                return callback(data)
            }
        })
    },

    getMinOrderSize: function(callback) {
        rest.symbol.details((err, data) => {
            if (err) {
                console.log();
            }
        })
    },

    trade: function (pair, price, callback) {
        var self = this
        console.log(pair, ' entering into trade on poloniex');
        polorest.trade({ pair, rate: price.toString(), amount, type: self.mode}, (err, data) => {
            if (err) {
                console.log(err);
            } else {
                console.log(pair, ' order was placed on Poloniex. Price ', price, ' amount ', amount, ' type ', self.mode);

                setTimeout(function() {
                    checkOrder(pair, orderId, () => {
                        callback()
                    })
                }, 2000)
                callback()
            }
        })
    },

    checkOrder: function (pair, orderId, callback) {
        if (!orderId && orderId === 0) {
            console.log(pair, ' Poloniex order was executed immediately');
            callback
        } else {
            polorest.returnOpenOrders(pair, (err, orders) => {
                if (err) {
                    console.log(err);
                } else {
                    let activeOrders = []
                    for (order of orders) {
                        activeOrders.push(order['orderNumber'])
                    }
                    if (activeOrders.indexOf(orderId.toString()) > -1) {
                        setTimeout(function(){
                            checkOrder(pair, orderId, callback)
                        }, 2000)
                    } else {
                        console.log(pair, ' Polo order was closed');
                        callback()
                    }
                }
            })
        }
    }
}

module.exports = PoloTrade;

