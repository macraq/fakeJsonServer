var _ = require('lodash');
var faker = require('faker');
var transactionsNumber = faker.random.number({min: 1000, max: 10000})
module.exports = {
    data: _.times(transactionsNumber, function (n) {
        var purchase = faker.commerce.price(100.0, 1600.00, 2);
        var buy = faker.commerce.price(100.00, 2600.00, 2);
        var dealerId = faker.random.number({min: 0, max: 2});
        var productId = faker.random.number({min: 0, max: 8});
        var fundId = false;
        if (productId > 3) {
            fundId = faker.random.number({min: 0, max: 3});
            productId = false;
        }

        return {
            transactionId: 10000+n,
            purchase: purchase,
            buy: buy,
            fundId: fundId,
            productId: productId,
            dealerId: dealerId
        }
    })
}
