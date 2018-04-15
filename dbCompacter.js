var CronJob = require('cron').CronJob;
var db = require('./datastore/db');

new CronJob('0 0 */2 * * *', () => {
  db.compact();
}, null, true, 'Asia/Shanghai');
