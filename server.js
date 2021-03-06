var jsonServer = require('json-server');

var path = require('path');
var _ = require('lodash');

var server = jsonServer.create();
var data = require(path.join(__dirname, 'db.json'));
var router = jsonServer.router(data);

var transactions = require(path.join(__dirname, 'transactions.js'));
var authorize = require(path.join(__dirname, 'authorize.js'));

var middlewares = jsonServer.defaults();

var authUser = false;

var isAuthorized = function (request) {
    return !(request.header("X-Auth") == undefined);
}

server.use(middlewares);

server.use(jsonServer.bodyParser);

server.post('/login', function (req, res) {
    var token = authorize.check(req.body.login, req.body.password, data.users);
    if (!token) {
        return res.sendStatus(403);
    }
    res.jsonp({token: token});
});

server.use(function (req, res, next) {
    if (authorize.isAuthorized(req.header("X-Auth"))) {
        next();
    } else {
        res.sendStatus(401);
    }
})

server.get('/transactions', function (req, res) {
    res.jsonp(transactions.data);
});

server.post('/transactions', function (req, res) {
    var last = _.last(transactions.data);
    var data = req.body;
    _.set(data, 'transactionId', _.add(last.transactionId, 1));
    transactions.data = _.concat(transactions.data, data);
    res.jsonp(data);
});

server.get('/summary', function (req, res) {
    var summary = {
        purchase: 0,
        buy: 0
    };
    _.each(transactions.data, function (transaction) {
        _.set(summary, 'purchase', _.add(summary.purchase, _.toNumber(transaction.purchase)));
        _.set(summary, 'buy', _.add(summary.buy, _.toNumber(transaction.buy)));
    });
    res.jsonp(summary);
});

server.get('/productSummary', function (req, res) {
    var summary = {};
    _.each(transactions.data, function (transaction) {
        if (transaction.productId) {
            if (!_.has(summary, transaction.productId)) {
                _.set(summary, transaction.productId, {
                    purchase: 0,
                    buy: 0
                });
            }
            _.set(summary, transaction.productId + ".purchase",
                _.add(_.get(summary, transaction.productId + ".purchase"), _.toNumber(transaction.purchase)));
            _.set(summary, transaction.productId + ".buy",
                _.add(_.get(summary, transaction.productId + ".buy"), _.toNumber(transaction.buy)));
        }

    })
    res.jsonp(summary);
});

server.get('/fundSummary', function (req, res) {
    var summary = {};
    var addFundBuy = function (fundId, value) {
        if (!_.has(summary, fundId)) {
            _.set(summary, fundId, {
                purchase: 0,
                buy: 0
            })
        }
        _.set(summary, fundId + ".buy",
            _.add(_.get(summary, fundId + ".buy"), value));
    };
    var addFundPurchase = function (fundId, value) {
        if (!_.has(summary, fundId)) {
            _.set(summary, fundId, {
                purchase: 0,
                buy: 0
            })
        }
        _.set(summary, fundId + ".purchase",
            _.add(_.get(summary, fundId + ".purchase"), value));
    };
    _.each(transactions.data, function (transaction) {
        if (_.has(transaction, 'fundId') && _.get(transaction, 'fundId')) {
            addFundBuy(transaction.fundId, _.toNumber(transaction.buy));
            addFundPurchase(transaction.fundId, _.toNumber(transaction.purchase));

        } else {
            var product = _.find(data.products, {"id": transaction.productId});
            if (product && _.size(product.funds)) {
                _.each(product.funds, function (fund) {
                    addFundBuy(fund.fundId, _.toNumber(transaction.buy*(fund.percent/100)));
                    addFundPurchase(fund.fundId, _.toNumber(transaction.purchase*(fund.percent/100)));
                });
            }
        }
    });
    res.jsonp(summary);
})

server.use(router);

server.listen(3000, function () {
    console.log('JSON Server is running');
});
