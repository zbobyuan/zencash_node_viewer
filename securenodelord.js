let Promise = require('bluebird');
let db = require('./datastore/db');

function get(lordId) {
  return getLord(lordId)
    .then(getSecureNodes);
}

function getLord(lordId) {
  return new Promise((resolve, reject) => {
    db.lords.findOne({_id: lordId}, (err, lord) => {
      if (err) {
        reject(err);
      } else if (!lord) {
        reject('not found');
      } else {
        resolve(lord);
      }
    });
  });
}

function getSecureNodes(lord) {
  return db.securenodes.findAsync({domain: {$in: lord.domains}})
    .then(nodes => {
      return {
        lord,
        securenodes: nodes,
      };
    });
}

module.exports = { get };
