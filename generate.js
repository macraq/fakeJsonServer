module.exports = function () {

    var faker = require("faker");
    var _ = require("lodash");
    var accessToken = faker.random.uuid();

    faker.locale = "pl";

    var summary = {
        purchase: 0,
        buy: 0
    };
    var productSumary = []
    var fundSummary = {
        purchase: 0,
        buy: 0
    };

    var dealerSummary = [];
    var productDealerSummary = [];
    var fundDealerSummary = [];

    var products = [
        {
            id: 0,
            name: "Rejestry zwykłe",
            funds: [
                {
                    fundId: 0,
                    percent: 60
                },
                {
                    fundId: 2,
                    percent: 40
                }
            ]
        },
        {
            id: 1,
            name: "PSO",
            funds: [
                {
                    fundId: 0,
                    percent: 30
                },
                {
                    fundId: 1,
                    percent: 70
                }
            ]
        },
        {
            id: 2,
            name: "IKE",
            funds: [
                {
                    fundId: 2,
                    percent: 10
                },
                {
                    fundId: 3,
                    percent: 90
                }
            ]
        },
        {
            id: 3,
            name: "IKZE",
            funds: [
                {
                    fundId: 3,
                    percent: 100
                }
            ]
        }
    ];

    var getProduct = function(productId){
        _.each(products, function(product){
            if(product.id == productId){
                return product;
            }
        })
    }

    var getDealerSummary = function (dealerId, operation) {
        if (!dealerSummary[dealerId]) {
            dealerSummary[dealerId] = {
                dealerId: dealerId,
                purchase: 0,
                buy: 0
            }
        }
        return dealerSummary[dealerId][operation];
    }

    var addPurchase = function (dealerId, value, fundId, productId) {
        var oldPurchase = getDealerSummary(dealerId, 'purchase');
        dealerSummary[dealerId]['purchase'] = _.add(oldPurchase, _.toNumber(value));
        summary['purchase'] = _.add(summary['purchase'], _.toNumber(value));

    }

    var addBuy = function (dealerId, value, fundId, productId) {
        var oldBuy = getDealerSummary(dealerId, 'buy');
        dealerSummary[dealerId]['buy'] = _.add(oldBuy, _.toNumber(value));
        summary['buy'] = _.add(summary['buy'], _.toNumber(value));
    }

    return {
        authorization: [
            {
                id: 0,
                accessToken: accessToken,
                login: "admin",
                password: "test1"
            },
            {
                id: 1,
                accessToken: false,
                login: "admin",
                password: "test2"
            }
        ],
        dealers: [
            {
                dealerId: 0,
                dealerName: "dealer 1",
            },
            {
                dealerId: 1,
                dealerName: "dealer 2",
            },
            {
                dealerId: 2,
                dealerName: "dealer 3",
            }
        ],
        funds: [
            {
                id: 0,
                name: "akcji polskich",
            },
            {
                id: 1,
                name: "stabilnego wzrostu",
            },
            {
                id: 2,
                name: "zrównoważone",
            },
            {
                id: 3,
                name: "dłużne polskie",
            }
        ],
        products: products,
        tradeVolume: _.times(faker.random.number({min: 1000, max: 10000}), function (n) {
            var purchase = faker.commerce.price(100.0, 1600.00, 2);
            var buy = faker.commerce.price(100.00, 2600.00, 2);
            var dealerId = faker.random.number({min: 0, max: 2});
            var productId = faker.random.number({min: 0, max: 8});
            var fundId = false;
            if (productId > 3) {
                fundId = faker.random.number({min: 0, max: 3});
                productId = false;
            }
            addPurchase(dealerId, purchase, fundId, productId);
            addBuy(dealerId, buy, fundId, productId);
            return {
                tradeId: n,
                purchase: purchase,
                buy: buy,
                fundId: fundId,
                productId: productId,
                dealerId: dealerId
            }

        }),
        tradeVolumeSummary: summary,
        dealerSummary: dealerSummary
    }
}
