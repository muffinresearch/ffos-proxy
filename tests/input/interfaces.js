
var interfaces = { lo0:
   [ { address: '127.0.0.1',
       netmask: '255.0.0.0',
       family: 'IPv4',
       internal: true },
     { address: 'fe80::1',
       netmask: 'ffff:ffff:ffff:ffff::',
       family: 'IPv6',
       scopeid: 1,
       internal: true } ],
  en0:
   [ { address: '192.168.10.10',
       netmask: '255.255.255.0',
       family: 'IPv4',
       internal: false } ],
  vboxnet1:
   [ { address: '192.168.59.3',
       netmask: '255.255.255.0',
       family: 'IPv4',
       internal: false } ] };

module.exports = {
  interfaces: interfaces
};
