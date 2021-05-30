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
    let permission = topic.startsWith(client.username + '/')
    permission = permission || (client.deviceProfile &&
        client.deviceProfile.group &&
        client.deviceProfile.group.indexOf(topic) > -1)

    return permission
}

module.exports = {
    authorizePub,
    authorizeSub
}