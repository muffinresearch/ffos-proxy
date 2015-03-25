'use strict';

var network = require('./network');
var utils = require('./utils');


function chooseDevice(deviceList) {
  return {
    name: 'device-id',
    type: 'list',
    message: 'Choose a device',
    choices: deviceList,
    filter: utils.trimBrackets,
  };
}

function chooseProxyIp() {
  return {
    name: 'proxy-ip',
    type: 'list',
    message: 'Choose a proxy IP',
    choices: network.getIps(),
    filter: utils.trimBrackets,
  };
}

function chooseProxyPort() {
  return {
    name: 'proxy-port',
    type: 'number',
    message: 'What port is your proxy running on',
    default: 8888
  };
}


module.exports = {
  chooseDevice: chooseDevice,
  chooseProxyPort: chooseProxyPort,
  chooseProxyIp: chooseProxyIp,
};
