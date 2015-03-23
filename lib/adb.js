var adbkit = require('adbkit');
var client = adbkit.createClient();
var _ = require('underscore');

function getDevicesList(devices) {
  var deviceList = _.pluck(devices, 'id');
  if (!deviceList.length) {
    throw Error('No devices are connected please connect a device');
  }
  return deviceList;
}

function pullFile(devicefilePath, targetFilePath) {

}

function pushFile(sourceFilePath, devicefilePath) {

}

module.exports = {
  client: client,
  getDevicesList: getDevicesList,
  pushFile: pushFile,
  pullFile: pullFile,
};
