const poloTrade = require('./poloTrade');
const bfxTrade = require('./BfxTrade');

let fakeBfxData = [{
    "type":"exchange",
    "currency":"eth",
    "amount":"100",
    "available":"100"
  },{
    "type":"exchange",
    "currency":"eos",
    "amount":"100",
    "available":"1000"
  },{
    "type":"exchange",
    "currency":"btc",
    "amount":"100",
    "available":"100"
  },{
    "type":"exchange",
    "currency":"usd",
    "amount":"100",
    "available":"100"
  },{
    "type":"exchange",
    "currency":"xmr",
    "amount":"100.0",
    "available":"100.0"
  },{
    "type":"exchange",
    "currency":"xrp",
    "amount":"100.0",
    "available":"100.0"
  },{
    "type":"exchange",
    "currency":"ltc",
    "amount":"100.0",
    "available":"100.0"
  },{
    "type":"exchange",
    "currency":"bch",
    "amount":"100.0",
    "available":"100.0"
  },{
    "type":"exchange",
    "currency":"neo",
    "amount":"100.0",
    "available":"100.0"
  },{
    "type":"exchange",
    "currency":"dash",
    "amount":"100.0",
    "available":"100.0"
  },{
    "type":"exchange",
    "currency":"etc",
    "amount":"100.0",
    "available":"100.0"
  }]

Balance = {
    balanceMatrix: {
        polo: {},
        bitfinex: {}
    },

    updateBalance: function(callback) {
        var self = this

        // To Fix - BFX call currently giving issues
        const bfxPromise = new Promise((res, rej) => {
            bfxTrade.getBalance(function(bfxData) {
                console.log('Requesting balance from Bitfinex');
                let funds = {}
                for (elem of fakeBfxData) {
                    if (elem["type"] === "exchange" && elem["available"]) {
                        funds[elem["currency"]] = parseFloat(elem["available"])
                    }
                }

                self.balanceMatrix.bitfinex = funds

                // console.log("Matrices = ", self.balanceMatrix);

                res()
            });
        });

        const poloPromise = new Promise((res, rej) => {
            poloTrade.getBalance(function(poloData) {
                console.log(('Requesting balance from Poloniex'));
                for (elem in poloData) {
                    self.balanceMatrix.polo[elem] = parseFloat(poloData[elem])
                }

                // console.log("Matrices = ", self.balanceMatrix);
                res()
            })
        })

        Promise.all([bfxPromise, poloPromise])
            .then( callback )
    },

    getBalance: function(exchange, pair, mode) {
        let coin = ''
        switch (exchange) {
            case 0:
                switch (mode) {
                    case "buy" :
                        coin = pair.substr(3)
                    break
                    case "sell":
                        coin = pair.substr(0, 3)
                    break
                }
                console.log("exchange", exchange, "pair", pair, "mode", mode, "bfx coin =", coin.toLowerCase());
            return this.balanceMatrix.bitfinex[coin.toLowerCase()]
            case 1:
                switch (mode) {
                    case "buy" :
                        coin = pair.split("_")[0]
                    break
                    case "sell":
                        coin = pair.split("_")[1]
                    break
                }
                console.log("exchange", exchange, "pair", pair, "mode", mode, "polo coin=", coin);
            return this.balanceMatrix.polo[coin]
        }
    }
}

module.exports = Balance