const rp = require('request-promise');

function get(url) {
  const options = {
    uri: url,
    json: true,
    timeout: 20000,//10 seconds
  };
  return rp(options);
}

module.exports = { get };
