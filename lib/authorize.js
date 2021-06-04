'use strict'


function authorizer(options) {
    this.options = options
}

authorizer.prototype.pub = function (client, packet, callback) {
    if (topicPermission(packet.topic, client)) callback(null)
    else return callback(new Error('Permission Error'))
}

authorizer.prototype.sub = function (client, topic, callback) {
    var self = this
    if (topicPermission(topic.topic, client, self.options)) callback(null, topic)
    else return callback(new Error('Permission Error'))
}

function topicPermission(topic, client, topicClaim) {
    if (!(client.deviceProfile && client.username)) return false
    return topic.startsWith(client.username + '/') || (client.deviceProfile['topics'] &&
        (client.deviceProfile['topics']).indexOf(topic) > -1)
}

module.exports = authorizer