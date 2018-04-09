let Promise = require('bluebird'),
  _ = require('lodash'),
  moment = require('moment'),
  parse_domain = require('parse-domain'),
  db = require('./datastore/db'),
  request = require('./request');

function start() {
  return getLords().then((lords) => {
    let emails = _.uniq(_.flatten(lords.map(lord => lord.emails)));
    return Promise.mapSeries(emails, email => {
      return request.get(`https://securenodes.sea.zensystem.io/api/grid/${email}/nodes`);
    }).then(responses => {
      let nodes = _.flatten(responses.map(resp => resp.rows));
      nodes.forEach(n => {
        let parsed = parse_domain(n.fqdn);
        n.subdomain = parsed.subdomain;
        n.domain = parsed.domain + '.' + parsed.tld;
      });
      return nodes;
    }).then(securenodes => {
      return Promise.mapSeries(securenodes, node => {
        let nodeid = node.id;
        delete node.id;
        //return db.securenodes.updateAsync()
        return new Promise((resolve, reject) => {
          db.securenodes.update({ id: nodeid }, { $set: node }, { upsert: true, returnUpdatedDocs: true },
            (err, numAffected, affectedDocuments, upsert) => {
              if (err) {
                reject(err);
              } else {
                resolve({
                  node: affectedDocuments,
                  upsert
                });
              }
            });
        });
      });
    }).then((nodes) => {
      let paymentArr = [], chalArr = [], exceptionArr = [];
      let now = moment();
      nodes.forEach(node => {
        exceptionArr.push(node.node.id);
        if (node.upsert) {
          paymentArr.push(node.node.id);
          chalArr.push(node.node.id);
        } else {
          if (node.node.payments && node.node.payments.length) {
            let latestPayment = node.node.payments[0];
            if (latestPayment.status === 'paid'
            && latestPayment.paidat
            && moment(latestPayment.paidat).add(23, 'hour').isAfter(now)) {
              //skit
            } else {
              paymentArr.push(node.node.id);
            }
          }
          if (node.node.challenges && node.node.challenges.length) {
            let latestChal = node.node.challenges[0];
            if (latestChal.result !== 'pass'
            || !latestChal.received
            || moment(latestChal.received).add(25, 'hour').isBefore(now)){
              chalArr.push(node.node.id);
            }
          } else {
            chalArr.push(node.node.id);
          }
        }
      });//forEach

      let paymentPromise = Promise.mapSeries(paymentArr, paymentNodeId => {
        return request.get(`https://securenodes.sea.zensystem.io/api/grid/${paymentNodeId}/pmts`)
          .then(payment => {
            return {
              nodeid: paymentNodeId,
              payments: payment.rows,
            };
          });
      });
      let chalPromise = Promise.mapSeries(chalArr, chalNodeId => {
        return request.get(`https://securenodes.sea.zensystem.io/api/grid/${chalNodeId}/crs`)
          .then(chal => {
            return {
              nodeid: chalNodeId,
              chals: chal.rows,
            };
          });
      });
      let exceptionPromise = Promise.mapSeries(exceptionArr, exceptionNodeId => {
        return request.get(`https://securenodes.sea.zensystem.io/api/grid/${exceptionNodeId}/ex`)
          .then(ex => {
            return {
              nodeid: exceptionNodeId,
              chals: ex.rows,
            };
          });
      });
      return Promise.join(paymentPromise, chalPromise, exceptionPromise)
        .then(([payments, chals, exceptions]) => {
          return Promise.mapSeries(payments, payment => {
            db.securenodes.update({id: payment.nodeid}, {$set: {payments: payment.payments}});
          }).then(() => {
            return Promise.mapSeries(chals, chal => {
              db.securenodes.update({id: chal.nodeid}, {$set: {challenges: chal.chals}});
            });
          }).then(() => {
            return Promise.mapSeries(exceptions, exception => {
              db.securenodes.update({id: exception.nodeid}, {$set: {exceptions: exception.chals}});
            });
          });
        });
    });
  })
    .catch(err => {
      console.error(err);
    })
    .then(() => {
      return Promise.delay(300 * 1000).then(start);
    });
}

function getLords() {
  return db.lords.findAsync({});
}

module.exports = { start };
