var express = require('express'),
  moment = require('moment');
var router = express.Router();
var createError = require('http-errors');
let securenodelord = require('../securenodelord');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/snls/:id', function(req, res, next) {
  securenodelord.get(req.params.id).then(lord => {
    let viewModel = buildLordViewModel(lord);
    res.render('index', {lord: viewModel});
  }).catch(err => {
    if (err === 'not found') {
      next(createError(404));
    } else {
      console.error(err);
      next({
        message: 'Oops',
      });
    }
  });
});

function buildLordViewModel(lord) {
  let securenodes = lord.securenodes;
  let model = {
    total: lord.securenodes.length,
    total_global: lord.globalTotal,
  };

  let totalAll = 0, totalAllPaid = 0, _7dAll = 0, _7dAllPaid = 0;
  let downCount = 0;
  securenodes.forEach(securenode => {
    if (lord.lord.domains.length === 1) {
      securenode.name = securenode.fqdn.replace(lord.lord.domains[0], '');
    } else {
      securenode.name = securenode.fqdn;
    }

    let paymentTotal = 0, paymentTotalPaid = 0, payment7d = 0, payment7dPaid = 0;
    let excludeDays7d = 0;
    securenode.status2 = getStatus2(securenode);
    if (securenode.status2 === 'down') {
      downCount++;
    }
    let payments = securenode.payments || [];
    for (let i = 0; i < payments.length; i++) {
      let payment = payments[i];
      let amount = parseFloat(payment.zen);
      paymentTotal += amount;
      if (payment.status === 'paid') {
        paymentTotalPaid += amount;
      }
      if (i < 7) {
        payment7d += amount;
        if (payment.status === 'paid') {
          payment7dPaid += amount;
        }
        if (payment.status === 'exclude') {
          excludeDays7d++;
        }
      }
    }
    securenode.paymentSummary = {
      total: paymentTotal,
      totalPaid: paymentTotalPaid,
      '7d': payment7d,
      '7dPaid': payment7dPaid,
      '7dExclude': excludeDays7d,
    };
    totalAll += paymentTotal;
    totalAllPaid += paymentTotalPaid;
    _7dAll += payment7d;
    _7dAllPaid += payment7dPaid;

    let now = moment();
    let chalTimeMin = 10000, chalTimeMax = 0, chalTimeSum = 0, chalCount = 0, acceptedChalCount = 0;
    let passChalCount = 0;
    let chalIn7d = true;
    let latestChalTime = null;
    for (let chal of securenode.challenges) {
      if (chal.result === 'wait') {
        continue;
      }
      if (chalIn7d) {
        if (isIn7d(now, chal.start)) {
          if (chal.result === 'pass' || (chal.result === 'confirm' && chal.seconds <= 300)) {
            passChalCount++;
          }
          if (chal.seconds !== null) {
            if (latestChalTime === null) {
              latestChalTime = chal.seconds;
            }
            chalTimeMin = chal.seconds < chalTimeMin ? chal.seconds : chalTimeMin;
            chalTimeMax = chal.seconds > chalTimeMax ? chal.seconds : chalTimeMax;
            chalTimeSum += chal.seconds;
            acceptedChalCount++;
          }
          chalCount++;
        } else {
          chalIn7d = false;
        }
      }
    }
    securenode.challengeSummary = {
      latest: latestChalTime,
      max: chalTimeMax === 0 ? '-' : chalTimeMax,
      min: chalTimeMin === 10000 ? '-' : chalTimeMin,
      avg: acceptedChalCount > 0 ? (chalTimeSum / acceptedChalCount).toFixed(1) : '-',
      pass: passChalCount,
      total: chalCount,
    };
  });

  model.paymentSummary = {
    total: totalAll,
    totalPaid: totalAllPaid,
    '7d': _7dAll,
    '7dPaid': _7dAllPaid,
  };
  let downPercent = downCount / securenodes.length;
  if (downPercent === 0) {
    model.overview = 'up';
  } else if (downPercent <= 0.3) {
    model.overview = 'warn';
  } else {
    model.overview = 'danger';
  }
  model.downPercent = (downPercent * 100).toFixed(0);
  model.securenodes = securenodes;
  return model;
}

function getStatus2(securenode) {
  if (securenode.status === 'down') {
    return 'down';
  } else if (securenode.status === 'up') {
    if (!securenode.exceptions || !securenode.exceptions.length) {
      return 'up';
    } else {
      let latestException = securenode.exceptions[0];
      return latestException.end ? 'up' : 'down';
    }
  }

  return 'down';
}

function isIn7d(now, date) {
  return moment(date).add(7, 'day').isAfter(now);
}

module.exports = router;
