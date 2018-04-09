let Datastore = require('nedb'),
  globalData = new Datastore({ filename: 'db/global_data', autoload: true });

module.exports = globalData;
