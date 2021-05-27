'use strict'

var debug = require('debug')('authbroker')
var jwt = require('jsonwebtoken')

const {
    authorizePub,
    authorizeSub
} = require('./authorize')

var Keycloak = require('keycloak-connect')


const kcConfig = {
    "realm": "master",
    "auth-server-url": "http://localhost:8080/auth",
    "ssl-required": "external",
    "resource": "admin-cli",
    "public-client": true,
    "confidential-port": 0
}

function authBroker(setting) {
    debug('authentication function is running...')
    /*
    const settings = {
        baseUrl: self.setting.auth.tokenHost,
        realmName: self.setting.auth.realm,
        username: self.setting.user.username,
        password: self.setting.user.password,
        grant_type: self.setting.client.grantType,
        client_id: self.setting.client.id
    } */
    
    this.keycloak = new Keycloak({}, kcConfig)
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
            callback(null, true, client)
        }, err => {
            console.log('Error', err);
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
    return function (client, packet, callback) {
        authorizePub(client, packet, callback)
    }

}

authBroker.prototype.authorizeSubscribe = function () {
    return function (client, sub, callback) {
        authorizeSub(client, sub, callback)
    }

}

module.exports = authBroker