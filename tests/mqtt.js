'use strict';

/*******************************************************************************
 * this test inspired by Aedes and Ponte project, a work by Matteo Collina
 *    Matteo Collina - https://github.com/eclipse/ponte
 *******************************************************************************/
var mqtt = require('mqtt')
var aedes = require('aedes')()
var authBroker = require('../lib/authbroker')
var expect = require('expect.js')

const fs = require('fs')


describe('Test against MQTT server', function () {
    var settings
    var rawdata = fs.readFileSync('example-realm.json')
    var validData = JSON.parse(rawdata)

    var envAuth = {
        client: {
            id: 'mqtt',
            secret: '66dddb49-4881-4b11-b467-36cd09fc0eca',
        },
        auth: {
            tokenHost: 'https://localhost:8080', // refrence to keycloak server that run by test.sh script
            tokenPath: '/auth/realms/demo/protocol/openid-connect/token',
            authorizePath: '/auth/realms/demo/protocol/openid-connect/auth',
        },
        salt: {
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

    before(function (done) {
        var authbroker = new authBroker(envAuth)

        aedes.authenticate() = authbroker.authenticateWithCredentials()
        aedes.authorizeSubscribe() = authbroker.authorizeSubscribe()
        aedes.authorizePublish() = authbroker.authorizePublish()

        const server = require('net').createServer(aedes.handle)
        const port = 1883

        server.listen(port, function () {
            console.log('server listening on port', port)
            done
        })

    })

    /*
    afterEach(function (done) {
        instance.close(done)

    })
    */


    function connect(options) {
        return mqtt.connect('mqtt://localhost', options)
    }


    it('should allow a client to publish and subscribe with allowed topics', function (done) {
        /*
        let clientId = validData[2].clientId
        let username = validData[2].realm
        let password = validData[2].adapters[0].secret.pwdhash
        let topic = validData[2].adapters[0].topics[0].topic
        */
        let clientId = 'mqtt'
        let username = 'hadi'
        let password = '1234'
        let topic = 'hadi/lamp'


        let options = {
            port: settings.mqtt.port,
            clientId: clientId,
            username: username,
            password: password,
            clean: true,
            protocolId: 'MQIsdp',
            protocolVersion: 3
        }
        let client = connect(options)
        client
            .subscribe(topic)
            .publish(topic, 'world')
            .on('message', function (topic, payload) {
                console.log(topic + ' ; ' + payload)
                expect(topic).to.eql(topic)
                expect(payload.toString()).to.eql('world')
                done()
            })
    })


    it('should support wildcards in mqtt', function (done) {
        let clientId = validData[1].clientId
        let username = validData[1].realm
        let mqttPassword = validData[1].adapters[0].secret.pwdhash

        let option = {
            port: settings.mqtt.port,
            clientId: clientId,
            username: username,
            password: mqttPassword,
            clean: true,
            protocolId: 'MQIsdp',
            protocolVersion: 3
        }

        let client = connect(option)
        client
            .subscribe('mohammad/#')
            .publish('mohammad/garden', 'hello')
            .on('message', function (topic, payload) {
                console.log(topic)
                console.log(payload.toString())
                expect(topic).to.eql('mohammad/garden')
                expect(payload.toString()).to.eql('hello')
            })
        client.end()
        done()
    })


    it('should throw a connection error if there is an unauthorized', function (done) {
        let client = mqtt.connect('mqtt://localhost:' + settings.mqtt.port, {
            clientId: "logger",
            username: 'hasan',
            password: 'baqi'
        })
        client.on('connect', function () {
            client.end()
            done(new Error('Expected connection error'))
        })
        client.on('error', function (error) {
            client.end()
            //console.log(error)
            expect(error.message).to.eql('Connection refused: Not authorized')
            done()
        })
    })



    it('should denny the subscription when an unauthorized subscribe is attempted', function (done) {

        let clientId = validData[2].clientId
        let username = validData[2].realm
        let mqttPassword = validData[2].adapters[1].secret.pwdhash

        let client = mqtt.connect('mqtt://localhost:' + settings.mqtt.port, {
            clientId: clientId,
            username: username,
            password: mqttPassword
        })
        client.subscribe('unauthorizedSubscribe', function (err, subscribes) {
            if (err) throw (err)
            client.end()
            expect(subscribes[0].qos).to.eql(0x80)
            done()
        })
    })



    it('should close the connection if an unauthorized publish is attempted', function (done) {

        let clientId = validData[2].clientId
        let username = validData[2].realm
        let mqttPassword = validData[2].adapters[1].secret.pwdhash

        let client = mqtt.connect('mqtt://localhost:' + settings.mqtt.port, {
            clientId: clientId,
            username: username,
            password: mqttPassword
        })
        var error
        client.on('message', function () {
            error = new Error('Expected connection close')
            client.end()
        })
        var closeListener = function () {
            client.removeListener('close', closeListener)
            if (error) {
                //console.log(error)
                done(error)
            } else {
                client.end()
                done()
            }
        }
        client.on('close', closeListener)
        client.subscribe('ali/#')
            .publish('ali/unauthorizedPublish', 'world')
    })

})