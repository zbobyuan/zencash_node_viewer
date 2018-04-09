let Datastore = require('nedb');

let db = {
  lords: require('./SecureNodeLord'),
  securenodes: require('./SecureNode'),
  global: require('./GlobalData'),
};

require('bluebird').promisifyAll(Datastore.prototype);

module.exports = db;
