'use strict';

var fs = require('fs');

var adb = require('adbkit');
var inquirer = require('inquirer');
var Promise = require('es6-promise').Promise;

var log = require('./log');
var questions = require('./questions');
var utils = require('./utils');
var settings = require('./settings');


// Stolen from the ADB Helper add-on
var B2G_TEST_COMMAND = 'test -f /system/b2g/b2g; echo $?';


if (typeof String.prototype.endsWith !== 'function') {
  String.prototype.endsWith = function(suffix) {
    return this.indexOf(suffix, this.length - suffix.length) !== -1;
  };
}


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


function getProfilePaths(deviceId) {
  var adbClient = adb.createClient();
  return new Promise(function(resolve, reject) {
    return adbClient.readdir(deviceId, settings.profileDir)
      .then(function(files) {
        var fileName;
        for (var i=0; i < files.length; i++) {
          fileName = files[i].name;
          if (fileName.endsWith('.default')) {
            resolve(settings.profileDir + '/' + fileName);
            break;
          }
        }
      }).catch(reject);
  });
}


function rebootDevice(deviceId, ask) {
  ask = ask === undefined ? true : ask;
  var adbClient = adb.createClient();
  return new Promise(function(resolve, reject) {
    function reboot() {
      return adbClient.reboot(deviceId)
        .then(function() {
          log.info('[%s] Rebooting', deviceId);
          resolve();
        }).catch(reject);
    }
    if (ask) {
      inquirer.prompt([questions.rebootDevice], function(answers){
        if (answers.doReboot === true) {
          return reboot();
        } else {
          log.warn('[%s] Reboot device for changes to take effect', deviceId);
          resolve();
        }
      });
    } else {
      return reboot();
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


function pullFile(deviceId, deviceFilePath, targetFilePath) {
  var client = adb.createClient();

  return client.stat(deviceId, deviceFilePath)
    .catch(function(err) {
      return new Promise(function(resolve, reject) {
        reject(err);
      });
    }).then(function() {
      return client.pull(deviceId, deviceFilePath)
        .then(function(transfer) {
          return new Promise(function(resolve, reject) {
            log.info('[%s] Pulling %s', deviceId, deviceFilePath);
            transfer.on('error', reject);
            if (targetFilePath) {
              // Either write out the stream.
              transfer.pipe(fs.createWriteStream(targetFilePath));
              transfer.on('end', function() {
                resolve();
              });
            } else {
              // Or buffer the stream into memory
              // and return as a string.
              var chunks = [];
              transfer.setEncoding('utf8');
              transfer.on('data', function(chunk) {
                chunks.push(chunk);
              });
              transfer.on('end', function() {
                var body = Buffer.concat(chunks);
                resolve(body);
              });
            }
          });
        }).catch(utils.handleError);
    });
}


function pushFile(deviceId, deviceFilePath, contents) {
  // contents can be a string (local path) or a stream.
  var client = adb.createClient();
  return client.push(deviceId, contents, deviceFilePath)
    .then(function(transfer) {
      return new Promise(function(resolve, reject) {
        log.info('[%s] Pushing to %s', deviceId,  deviceFilePath);
        transfer.on('end', function() {
          log.info('[%s] Push complete', deviceId);
          resolve();
        });
        transfer.on('error', reject);
      });
    });
}


module.exports = {
  findDevices: findDevices,
  getDevicesList: getDevicesList,
  getProfilePaths: getProfilePaths,
  pushFile: pushFile,
  pullFile: pullFile,
  rebootDevice: rebootDevice,
};
