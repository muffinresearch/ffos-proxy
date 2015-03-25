'use strict';

var adb = require('adbkit');
var chalk = require('chalk');
var inquirer = require('inquirer');
var Promise = require('es6-promise').Promise;

var questions = require('./questions');

// Stolen from the ADB Helper add-on
var B2G_TEST_COMMAND = 'test -f /system/b2g/b2g; echo $?';


function getDevicesList(devices, opt) {
  opt = opt || {};
  devices = devices || [];
  var onlyFFOS = typeof opt.onlyFFOS === 'undefined' ? true : opt.onlyFFOS;
  var filtered = devices.filter(function(item) {
    return onlyFFOS ? item.isFirefoxOS : true;
  });
  var deviceList = filtered.map(function(item) {
    return item.id + (item.isFirefoxOS ? ' (FFOS)' : ' (Android)');
  });
  if (!deviceList.length) {
    throw Error('No devices are connected please connect a device');
  }
  return deviceList;
}

function rebootDevice(deviceId, ask) {
  ask = ask === undefined ? true : ask;
  var adbClient = adb.createClient();

  return new Promise(function(resolve, reject) {

    function reboot() {
      adbClient.reboot(deviceId).then(function() {
        console.log(chalk.red('[%s] Rebooting'), deviceId);
        resolve();
      }).catch(reject);
    }

    if (ask) {
      inquirer.prompt([questions.rebootDevice], function(answers){
        if (answers.doReboot === true) {
          reboot();
        } else {
          console.log(chalk.red('Reboot device for changes to take effect'));
          resolve();
        }
      });
    } else {
      reboot();
    }
  });
}

function findDevices() {
  var adbClient = adb.createClient();
  return adbClient.listDevices().then(function(devices) {
    return Promise.all(devices.map(function(device) {
      // Test for Firefox OS on devices, annotate the device list with result.
      return adbClient.shell(device.id, B2G_TEST_COMMAND)
        .then(adb.util.readAll)
        .then(function(output) {
          // This is counterintuitive: The command result is the exit code,
          // which is 1 for failure, which means Firefox OS was *not* detected.
          device.isFirefoxOS = (output.toString('utf8').charAt(0) === '0');
          return device;
        });
    }));
  });
}


function pullFile(deviceId, devicefilePath) {
  var client = adb.createClient();
  return client.pull(deviceId, devicefilePath)
    .then(function(transfer) {
      return new Promise(function(resolve, reject) {
        console.log('[%s] Pulling %s', deviceId, devicefilePath);
        transfer.on('progress', function(stats) {
          console.log('[%s] Pulled %d bytes so far',
            deviceId,
            stats.bytesTransferred);
        });
        transfer.on('finish', function() {
          console.log('[%s] Pull complete', deviceId);
          resolve(transfer);
        });
        transfer.on('error', reject);
      });
    });
}


function pushFile(deviceId, deviceFilePath, contents) {
  // contents can be a string (local path) or a stream.
  var client = adb.createClient();
  return client.push(deviceId, contents, deviceFilePath)
    .then(function(transfer) {
      return new Promise(function(resolve, reject) {
        transfer.on('progress', function(stats) {
          console.log('[%s] Pushed %d bytes so far',
            deviceId,
            stats.bytesTransferred);
        });
        transfer.on('end', function() {
          console.log('[%s] Push complete', deviceId);
          resolve();
        });
        transfer.on('error', reject);
      });
    });
}


module.exports = {
  findDevices: findDevices,
  getDevicesList: getDevicesList,
  pushFile: pushFile,
  pullFile: pullFile,
  rebootDevice: rebootDevice,
};
