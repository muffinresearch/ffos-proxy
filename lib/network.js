var os = require('os');
var _ = require('underscore');


function getIps(interfaces) {
  interfaces = interfaces || os.networkInterfaces();
  var ips = [];
  Object.keys(interfaces).forEach(function(key) {
    var ipv4Interfaces = _.map(_.filter(interfaces[key], function(obj) {
      return obj.family === 'IPv4';
    }), function(item) {
      return item.address + ' (' + key + ')';
    });
    ips = ips.concat(ipv4Interfaces);
  });
  return ips;
}

module.exports = {
  getIps: getIps,
};
