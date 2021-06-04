'use strict'

var debug = require('debug')('authbroker')
var jwt = require('jsonwebtoken')

const Authorizer = require('./authorize')

var Keycloak = require('keycloak-connect')

function authBroker(setting) {
    debug('authentication function is running...')
    this.keycloak = new Keycloak({}, setting.auth)
    this.authorizer = new Authorizer(setting)
    this.setting = setting
}


/*
  Used when the device is sending credentials.
*/
authBroker.prototype.authenticateWithCredentials = function () {
    var self = this
    return async function (client, username, password, callback) {
        if (username === undefined || password === undefined) {
            debug('username or password is empty')
            var error = new Error('Auth error')
            error.returnCode = 104
            callback(error, false)
        }

        await self.keycloak.grantManager.obtainDirectly(username, password.toString()).then(grant => {
            const profile = jwt.decode(grant.access_token.token)
            if (profile.err) {
                return callback('Error parsing token', false)
            }
            client.deviceProfile = profile
            client.username = username
            client.password = password.toString()
            callback(null, true, client)
        }, err => {
            debug('Error:', err);
            callback(err, false)
        });

    }
}

/*
  Used when the device is sending access token.
*/
authBroker.prototype.authenticateWithAccessToken = function () {
    var self = this

    return function (req, callback) {
        if (req.access_token === undefined) {
            debug('access token is empty')
            var error = new Error('Auth error')
            error.returnCode = 104
            return callback(error, false)
        }

        var profile = jwt.decode(req.access_token)

        if (profile.err) {
            return callback('Error getting UserInfo', false)
        }

        req.deviceProfile = profile
        return callback(null, true, req)
    }
}

authBroker.prototype.authenticateWithJWT = function () {
    var self = this
    return function (client, username, password, callback) {
        if (username !== 'JWT') {
            return callback('Invalid Credentials', false)
        }

        jwt.verify(
            password,
            new Buffer(self.setting.clientSecret, 'base64'),
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