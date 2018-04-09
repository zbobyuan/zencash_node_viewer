let Datastore = require('nedb'),
  lord = new Datastore({ filename: 'db/secure_node_lords', autoload: true });

require('bluebird').promisifyAll(Datastore.prototype);

module.exports = lord;
