'use strict';

var network = require('./network');
var utils = require('./utils');
var path = require('path');

var rebootDevice = {
  name: 'doReboot',
  type: 'confirm',
  default: false,
  message: 'Reboot now?',
};

function chooseDevice(deviceList) {
  return {
    name: 'device-id',
    type: 'list',
    message: 'Choose a device',
    choices: deviceList,
    filter: utils.trimBrackets,
  };
}

function chooseCert(certsDir) {
  return {
    name: 'cert',
    type: 'list',
    message: 'Choose a certificate',
    choices: utils.getCertsList(certsDir),
    filter: function(value) {
      return path.join(certsDir, value);
    }
  };
}

function chooseProxyIp() {
  return {
    name: 'proxy_ip',
    type: 'list',
    message: 'Choose a proxy IP',
    choices: network.getIps(),
    filter: utils.trimBrackets,
  };
}

function chooseProxyPort() {
  return {
    name: 'proxy_port',
    type: 'number',
    message: 'What port is your proxy running on',
    default: 8888
  };
}


module.exports = {
  chooseCert: chooseCert,
  chooseDevice: chooseDevice,
  chooseProxyPort: chooseProxyPort,
  chooseProxyIp: chooseProxyIp,
  rebootDevice: rebootDevice,
};
