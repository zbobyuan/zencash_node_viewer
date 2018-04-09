let Datastore = require('nedb');

let db = {
  lords: require('./SecureNodeLord'),
  securenodes: require('./SecureNode'),
};

require('bluebird').promisifyAll(Datastore.prototype);

module.exports = db;
