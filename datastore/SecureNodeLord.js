let Datastore = require('nedb'),
  lord = new Datastore({ filename: 'db/secure_node_lords', autoload: true });

module.exports = lord;
