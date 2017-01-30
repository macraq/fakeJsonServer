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
    if(!token){
        return res.sendStatus(403);
    }
    res.jsonp({token:token});
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

server.post('/transactions', function(req, res){
    var last = _.last(transactions.data);
    var data = req.body;
    _.pull(data, _.add(last.transactionId, 1));
    _.pull(transactions.data, data);
    res.jsonp(data);
});

server.get('/summary', function (req, res) {
    var summary = {
        purchase: 0,
        buy: 0
    }
    _.each(transactions.data, function (transaction) {
        summary.purchase = _.add(summary.purchase, _.toNumber(transaction.purchase));
        summary.buy = _.add(summary.buy, _.toNumber(transaction.buy));
    })
    res.jsonp(summary);
});

server.use(router);

server.listen(3000, function () {
    console.log('JSON Server is running');
});
