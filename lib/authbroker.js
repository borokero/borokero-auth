'use strict'

var debug = require('debug')('authbroker')
var jwt = require('jsonwebtoken')
const Authorizer = require('./authorize')

function authBroker(setting) {
    debug('authentication function is running...')
    this.authorizer = new Authorizer(setting)
    this.setting = setting
}

authBroker.prototype.authenticateWithJWT = function () {
    var self = this
    return function (client, username, password, callback) {
        if (username !== 'JWT') {
            return callback('Invalid Credentials', false)
        }

        jwt.verify(
            password,
            Buffer.from(self.setting.clientSecret, 'base64'),
            function (err, profile) {
                if (err) {
                    return callback('Error getting UserInfo', false)
                }
                debug('Authenticated client ' + profile.user_id)
                client.deviceProfile = profile
                return callback(null, true, client)
            }
        )
    }
}

authBroker.prototype.authorizePublish = function () {
    var self = this

    return function (client, packet, callback) {
        self.authorizer.pub(client, packet, callback)
    }
}

authBroker.prototype.authorizeSubscribe = function () {
    var self = this

    return function (client, sub, callback) {
        self.authorizer.sub(client, sub, callback)
    }
}

module.exports = authBroker