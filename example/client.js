var mqtt = require('mqtt')
  , host = 'mqtt://localhost'
  , port = '1883'

var settings = {
  keepalive: 1000,
  protocolId: 'MQIsdp',
  protocolVersion: 3,
  clientId: 'Thermostat1398', //This is registered bi lib/insertDemoDB.js
  username:'hadi',
  password: '1234'
}

// client connection
var client = mqtt.connect(host, settings)


client.subscribe('/kitchen/fan')

client.on('message', function (topic, message) {
  console.log(message)
})

setInterval(sendTemperature, 5000, client)

function sendTemperature(client){	

  console.log("Sending event")

	var t = {
		T: Math.random() * 100,
		Units: "C"
	}

  //publish on the "temperature" topic
	client.publish('/kitchen/fan', JSON.stringify(t))
}