# Authentication and Authorization Module for Brokers


<div align="center">
    <img src="https://raw.githubusercontent.com/borokero/borokero-auth/main/docs/asset/repository-open-graph.png" width="500px"</img> 
</div>

Authentication and Authorization module of MQTT/CoAP Brokers based on NodeJS for IoT or Internet of Things. This repo is under development.


##  Getting Started

* 
* If you want to run a test locally, clone this repo.

``` bash
git clone https://github.com/borokero/borokero-auth
cd borokero-auth
npm install
npm run test
```
It runs tests.

### How Using it
This module use Node-style callback and it can be used with [Aedes](https://github.com/mcollina/aedes).

``` js
'use strict'
var aedes = require('aedes')
var authBroker = require('@borokero/borokero-auth')


var envAuth = {
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

aedes.authenticate = authbroker.authenticateWithJWT()
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

## Authors / Contributors

* [Hadi Mahdavi](https://twitter.com/kamerdack)



## Credits / Inspiration

* Matteo Collina for Mosca, Aedes, Ponte (https://github.com/mcollina/mosca)
* Eugenio Pace for Auth0 Mosca inspiration (https://github.com/eugeniop/auth0mosca)


## Copyright

MIT - Copyright (c) 2019 ioKloud
