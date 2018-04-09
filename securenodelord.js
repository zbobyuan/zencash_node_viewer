let Promise = require('bluebird'),
  moment = require('moment');
let db = require('./datastore/db');

function get(lordId) {
  return getLord(lordId)
    .then(getDomains)
    .then(getSecureNodes)
    .then(format);
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

function getSecureNodes(domains) {
  return db.securenodes.findAsync({domain: {$in: domains}});
}

function getDomains(lord) {
  return lord.domains;
}

function format(secureNodes) {
  let details = {
    count: secureNodes.length,
    securenodes: secureNodes.map(formatOne),
  };

  return details;
}

function formatOne(secureNode) {
  let result = {
    id: secureNode.id,
    payments: (secureNode.payments || []).slice(0, 7),
    challenges: (secureNode.challenges || []).slice(0, 7),
  };
  return result;
}

module.exports = { get };
