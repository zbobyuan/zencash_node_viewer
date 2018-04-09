let Datastore = require('nedb'),
  securenode = new Datastore({ filename: 'db/secure_nodes', autoload: true });

securenode.ensureIndex({ fieldName: 'id', unique: true });
securenode.ensureIndex({ fieldName: 'fqdn', unique: true });
securenode.ensureIndex({ fieldName: 'domain', unique: false });

module.exports = securenode;
