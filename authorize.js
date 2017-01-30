var _ = require("lodash");
var faker = require("faker");
var authorized = {};
var check = function (login, password, users) {
    var token = false;
    _.each(users, function (user) {
        if (user.login == login && user.password == password) {
            token = faker.random.uuid();
        }
    });
    authorized[token] = _.now();
    return token;
}
var isAuthorized = function (token) {
    if (!authorized[token]) {
        return false;
    } else {
        return true;
    }
}

module.exports = {
    check: check,
    isAuthorized: isAuthorized
}