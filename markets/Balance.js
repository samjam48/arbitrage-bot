const poloTrade = require('./poloTrade')
const bfxTrade = require('./BfxTrade')

Balance = {
    balanceMatrix: {
        polo: {},
        bitfinex: {}
    },

    updateBalance: function(callback) {
        var self = this
        bfxTrade.getBalance(function(bfxData) {
            console.log('Requesting balance from Bitfinex');
            let funds = {}
            for (elem of bfxData) {
                if (elem["type"] === "exchange" && elem["available"]) {
                    fund[elem["currency"]] = parseFloat(elem["available"])
                }
            }

            self.balanceMatrix.bitfinex = funds

            poloTrade.getBalance(function(poloData) {
                console.log(('Requesting balance from Poloniex'));
                for (elem in poloData) {
                    self.balanceMatrix.polo[elem] = parseFloat(poloData[elem])
                }

                console.log(self.balanceMatrix);
                callback()
            })
        })

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
            return this.balanceMatrix.polo[coin]
        }
    }
}

module.exports = Balance