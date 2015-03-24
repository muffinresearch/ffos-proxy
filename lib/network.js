var os = require('os');

function getIps(interfaces) {
  interfaces = interfaces || os.networkInterfaces();
  var ips = [];

  Object.keys(interfaces).forEach(function(key) {

    // Filter out ipvv4 addresses.
    var ipV4 = interfaces[key].filter(function(obj) {
      return obj.family === 'IPv4';
    });
    // Build a ip + friendly name string.
    var ipv4Interfaces = ipV4.map(function(item) {
      return item.address + ' (' + key + ')';
    });

    ips = ips.concat(ipv4Interfaces);
  });
  return ips;
}

module.exports = {
  getIps: getIps,
};
