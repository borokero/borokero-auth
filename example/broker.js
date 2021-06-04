'use strict'

var aedes = require('aedes')()
var authBroker = require('../lib/authbroker')

var envAuth = {
  auth: {
    realm: "tokenRealmTest",
    "auth-server-url": "http://localhost:8080/auth",
    "ssl-required": "external",
    resource: "admin-cli",
    "public-client": true,
    "confidential-port": 0,
    keys: 'topics' // object key that indicates allowed topics
  },
  jwt: {
    salt: 'salt', //salt by pbkdf2 method
    digest: 'sha512',
    // size of the generated hash
    hashBytes: 64,
    // larger salt means hashed passwords are more resistant to rainbow table, but
    // you get diminishing returns pretty fast
    saltBytes: 16,
    // more iterations means an attacker has to take longer to brute force an
    // individual password, so larger is better. however, larger also means longer
    // to hash the password. tune so that hashing the password takes about a
    // second
    iterations: 10
  },
  wildCard: {
    wildcardOne: '+',
    wildcardSome: '#',
    separator: '/'
  },
  adapters: {
    mqtt: {
      limitW: 50,
      limitMPM: 10
    }
  }
}

var authbroker = new authBroker(envAuth)

aedes.authenticate = authbroker.authenticateWithCredentials()
aedes.authorizeSubscribe = authbroker.authorizeSubscribe()
aedes.authorizePublish = authbroker.authorizePublish()

const server = require('net').createServer(aedes.handle)
const port = 1883

server.listen(port, function () {
  console.log('server listening on port', port)
})

aedes.on('clientError', function (client, err) {
  console.log('client error', client.id, err.message, err.stack)
})

aedes.on('connectionError', function (client, err) {
  console.log('client error', client, err.message, err.stack)
})

aedes.on('publish', function (packet, client) {
  if (client) {
    console.log('message from client', client.id)
  }
})

aedes.on('subscribe', function (subscriptions, client) {
  if (client) {
    console.log('subscribe from client', subscriptions, client.id)
  }
})

aedes.on('client', function (client) {
  console.log('new client', client.id)
})