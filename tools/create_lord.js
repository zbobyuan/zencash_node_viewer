const usage = 'usage: node create_lord.js username email domain';
let db = require('../datastore/db');

var args = process.argv.slice(2);
if (args.length != 3){
  throw new Error(usage);
}

var lord = {name: args[0],
  emails: [args[1]],
  domains: [args[2]],};

db.lords.insert(lord, (err, doc) => {
  console.log(doc._id);
});
