'use strict'

function authorizePub(client, packet, callback) {
    const topic = packet.topic
    if (topicPermission(topic, client)) callback(null)
    else return callback(new Error('Permission Error'))
}

function authorizeSub(client, topic, callback) {
    const topicSelected = topic.topic
    if (topicPermission(topicSelected, client)) callback(null, topic)
    else return callback(new Error('Permission Error'))
}

function topicPermission(topic, client) {
    return client.deviceProfile &&
        client.deviceProfile.group &&
        client.deviceProfile.group.indexOf(topic) > -1
}

module.exports = {
    authorizePub,
    authorizeSub
}