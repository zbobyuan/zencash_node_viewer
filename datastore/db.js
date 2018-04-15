let Datastore = require('nedb');

let db = {
  lords: require('./SecureNodeLord'),
  securenodes: require('./SecureNode'),
  global: require('./GlobalData'),
  compact: function() {
    this.securenodes.persistence.compactDatafile();
    this.global.persistence.compactDatafile();
  },
};

require('bluebird').promisifyAll(Datastore.prototype);

module.exports = db;
