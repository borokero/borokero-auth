# Authentication and Authorization Module for Brokers

[![Build Status](https://travis-ci.com/borokero/borokero-auth.svg)](https://travis-ci.com/borokero/borokero-auth)

<div align="center">
    <img src="https://raw.githubusercontent.com/borokero/borokero-auth/main/docs/asset/repository-open-graph.png" width="500px"</img> 
</div>

Authentication and Authorization module of HTTP/MQTT/CoAP Brokers based on NodeJS for IoT or Internet of Things. This repo is under development.


##  Getting Started

* 
* If you want to run a test locally, clone this repo.

``` bash
git clone https://github.com/borokero/borokero-auth
cd borokero-auth
npm install
npm run test
```
It runs tests. You should attention broker needs to configure keycloak. Scripts start-server.sh and stop-server.sh help to start and stop [Keycloak](https://www.keycloak.org/) server with a demo realm. it needs docker command.

``` bash
bash ./scripts/start-server.sh
```
It configs keycloak by demo clients and users. 


### How Using it
This module use Node-style callback and it can be used with [Aedes](https://github.com/mcollina/aedes).

``` js
'use strict'
var ponte = require('ponte')
var authBroker = require('@borokero/borokero-auth')


var envAuth = {
  user: {
    username: 'admin',
    password: 'admin'
  },
  client: {
    id: 'admin-cli',
    secret: '66dddb49-4881-4b11-b467-36cd09fc0eca',
    grantType: 'password'
  },
  auth: {
    tokenHost: 'http://localhost:8080/auth', // refrence to keycloak server that run by test.sh script
    realm: 'tokenRealmTest',
    tokenPath: '/auth/realms/borokero/protocol/openid-connect/token',
    authorizePath: '/auth/realms/borokero/protocol/openid-connect/auth',
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
```



## Contributing

[![contributions welcome](https://img.shields.io/badge/contributions-welcome-brightgreen.svg?style=flat)](https://github.com/dwyl/esta/issues)

Anyone with interest in or experience with the following technologies are encouraged to join the project.
And if you fancy it, join the [Telegram group](t.me/joinchat/AuKmG05CNFTz0bsBny9igg) here for Devs and say Hello!


## Authors / Contributors

* [Hadi Mahdavi](https://twitter.com/kamerdack)



## Credits / Inspiration

* Matteo Collina for Mosca, Aedes, Ponte (https://github.com/mcollina/mosca)
* Eugenio Pace for Auth0 Mosca inspiration (https://github.com/eugeniop/auth0mosca)


## Copyright

MIT - Copyright (c) 2019 ioKloud
