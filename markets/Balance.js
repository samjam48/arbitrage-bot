const poloTrade = require('./poloTrade')
const bfxTrade = require('./BfxTrade')

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
                for (elem of bfxData) {
                    if (elem["type"] === "exchange" && elem["available"]) {
                        fund[elem["currency"]] = parseFloat(elem["available"])
                    }
                }

                self.balanceMatrix.bitfinex = funds

                console.log("Matrices = ", self.balanceMatrix);

                res()
            });
        });

        const poloPromise = new Promise((res, rej) => {
            poloTrade.getBalance(function(poloData) {
                console.log(('Requesting balance from Poloniex'));
                for (elem in poloData) {
                    self.balanceMatrix.polo[elem] = parseFloat(poloData[elem])
                }

                console.log("Matrices = ", self.balanceMatrix);
                res()
            })
        })

        Promise.all([bfxPromise, poloPromise])
            .then( callback )
    },

    getBalance: function(exchange, pair, mode) {
        let coin = ''
        console.log("exchange", exchange, "pair", pair, "mode", mode);
        
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
                console.log("exchange bfx =", this.balanceMatrix.bitfinex);
                console.log("bfx coin =", coin.toLowerCase());
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
                console.log("exchange polo =", this.balanceMatrix.polo);
                console.log("polo coin=", coin);
            return this.balanceMatrix.polo[coin]
        }
    }
}

module.exports = Balance