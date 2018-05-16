let Promise = require('bluebird');
let _ = require('lodash');
let db = require('./datastore/db');

function get(lordId) {
  return Promise.join(getLord(lordId), getGlobalData())
    .then(([lord, globalData]) => {
      return {
        lord,
        globalTotal: globalData
      };
    }).then(getSecureNodes);
}

function getLord(lordId) {
  return db.lords.findOneAsync({_id: lordId});
}

function getGlobalData() {
  return db.global.findOneAsync({_id: 1})
    .then(data => data.total);
}

function getSecureNodes(data) {
  return Promise.mapSeries(data.lord.domains, domain => {
    return db.securenodes.findAsync({fqdn: {$regex: new RegExp(`${domain}$`)}});
  }).then(nodesArr => {
    return _.flatten(nodesArr);
  }).then(nodes => {
    return {
      globalTotal: data.globalTotal,
      lord: data.lord,
      securenodes: nodes,
    };
  });
}

module.exports = { get };
