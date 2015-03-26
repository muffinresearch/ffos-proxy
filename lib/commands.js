'use strict';

var cp = require('child_process');
var fs = require('fs');
var path = require('path');
var stream = require('stream');
var format = require('util').format;

var inquirer = require('inquirer');
var chalk = require('chalk');
var Promise = require('es6-promise').Promise;
require('shelljs/global');

var questions = require('./questions');
var utils = require('./utils');
var adb = require('./adb');
var settings = require('./settings');

function pushUserJS(deviceId, userjs, answers) {
  // Check for any existing conf that's not delimited.
  // this will throw and error if an unMarked proxy block
  // is discovered.

  utils.detectLegacyConf(userjs);
  // Prepare the template
  var newUserJS;
  var templateString = fs.readFileSync(
    __dirname + '/../templates/proxy.tmpl', 'utf8');
  var templatedBlock = utils.templateProxyBlock(templateString,
                                                answers);
  if (utils.hasProxyBlock(userjs)) {
    // Replace existing block with the new one.
    newUserJS = utils.replaceProxyBlock(userjs, templatedBlock);
  } else {
    // Otherwise append it.
    newUserJS = userjs + '\n' + templatedBlock;
  }
  newUserJS = newUserJS.trim();
  // Push block
  var readable = new stream.Readable();
  readable.push(newUserJS);
  readable.push(null);
  return adb.pushFile(deviceId, settings.userJsPath, readable)
    .then(function() {
      console.log(chalk.green('[%s] Pushed proxy conf to %s'),
                  deviceId, settings.userJsPath);
      adb.rebootDevice(deviceId).catch(utils.handleError);
    });
}


function enableProxy() {
  adb.findDevices()
    .then(function(devices) {
      var deviceList = adb.getDevicesList(devices);
      var choices = [];
      var prependDevice = true;
      if (deviceList.length > 1) {
        prependDevice = false;
        choices.push(questions.chooseDevice(deviceList));
      }
      choices.push(questions.chooseProxyIp());
      choices.push(questions.chooseProxyPort());
      inquirer.prompt(choices, function(answers){
        if (prependDevice === true) {
          answers['device-id'] = utils.trimBrackets(deviceList[0]);
        }
        var deviceId = answers['device-id'];
        adb.pullFile(deviceId, settings.userJsPath)
          .then(function(userjs){
            pushUserJS(deviceId, userjs, answers);
          })
          .catch(function(err) {
            if (err.toString().indexOf('ENOENT') > -1){
              pushUserJS(deviceId, '', answers);
            } else {
              utils.handleError(err);
            }
          });
      });
    })
    .catch(function(err) {
      utils.handleError(err);
    });
}

function disableProxy() {
  adb.findDevices()
    .then(function(devices) {
      var deviceList = adb.getDevicesList(devices);
      function handleAnswers(answers) {
        if (!answers) {
          answers = {};
          answers['device-id'] = utils.trimBrackets(deviceList[0]);
        }
        var deviceId = answers['device-id'];
        adb.pullFile(deviceId, settings.userJsPath).then(function(userjs){
          // Check for any existing conf that's not delimited.
          // this will throw and error if an unMarked proxy block
          // is discovered.
          utils.detectLegacyConf(userjs);
          // Remove the existing delimited conf.
          if (utils.hasProxyBlock(userjs) &&
              utils.containsProxyConf(userjs)) {
            console.log('[%s] Removing existing proxy conf', deviceId);
            var newUserJS = utils.replaceProxyBlock(userjs, '');
            var readable = new stream.Readable();
            readable.push(newUserJS.trim());
            readable.push(null);
            adb.pushFile(deviceId,
                         settings.userJsPath, readable).then(function() {
              adb.rebootDevice(deviceId).catch(utils.handleError);
            }).catch(utils.handleError);
          } else {
            console.log(chalk.green('Nothing to do. No Proxy conf exists'));
          }
        }).catch(function(err) {
           if (err.toString().indexOf('ENOENT') > -1){
              console.error(err.toString());
              console.log(chalk.green('Nothing to do. No "%s" found on device'),
                          settings.userJsPath);
           } else {
              utils.handleError(err);
           }
        });
      }
      if (deviceList.length > 1) {
        inquirer.prompt([questions.chooseDevice(deviceList)],
                        handleAnswers);
      } else {
        handleAnswers();
      }
    })
    .catch(function(err) {
      utils.handleError(err);
    });
}


function pullCert(deviceId, devicePath, targetPath) {
  return new Promise(function(resolve, reject) {
    adb.pullFile(deviceId, devicePath, targetPath)
      .then(function() {
        console.log(chalk.cyan('Written %s to %s'),
                    devicePath, utils.collapseHomeDir(targetPath));
        var backupPath = format('%s.%s', targetPath, deviceId);
        fs.lstat(backupPath, function(err) {
          if (err) {
            console.log(chalk.cyan('Backing up %s to %s'),
                        targetPath, utils.collapseHomeDir(backupPath));
            utils.copyFile(targetPath, backupPath)
             .then(resolve)
             .catch(reject);
          } else {
            console.log(chalk.cyan('Backup already exists. Skipping'));
            resolve();
          }
       });
    }).catch(reject);
  });
}


function clearCertPassword() {
  return new Promise(function(resolve, reject) {
    console.log(chalk.cyan('Clearing the password on the existing db'));
    var certsdb = path.join(__dirname, '/../tmp');
    var pw = path.join(__dirname, '/../.blank-password.txt');
    var child = cp.spawn(which('certutil'),
                         ['-W', '-d', 'sql:' + certsdb, '-f', pw, '-@', pw]);
    child.on('error', reject);
    child.on('exit', function() {
      console.log('Done!');
      resolve();
    });
  });
}

function addCertToDb(certPath) {
  return new Promise(function(resolve, reject) {
    console.log(chalk.cyan('Adding cert to db'));
    var certsdb = path.join(__dirname, '/../tmp');
    certPath = certPath || '/usr/local/CharlesCA/certs/ca_cert.pem';
    var child = cp.spawn(which('certutil'), [
      '-A', '-n', 'FFOS Proxify', '-i', certPath,
      '-t', 'TC,,', '-d', 'sql:' + certsdb]);
    child.on('error', reject);
    child.on('exit', function() {
      console.log('Done!');
      resolve();
    });
  });
}

function checkCertIsValid() {
  return new Promise(function(resolve, reject) {
    console.log(chalk.cyan('Check cert validity'));
    var certsdb = path.join(__dirname, '/../tmp');
    var child = cp.spawn(which('certutil'), [
      '-V', '-u', 'V', '-n', 'FFOS Proxify', '-d', 'sql:' + certsdb]);
    child.on('error', reject);
    child.on('exit', function(code) {
      if (code !== 0) {
        reject(new Error('Cert was invalid!!!!'));
      } else {
        resolve();
      }
    });
  });
}

function addCerts() {
  var certutilPath = utils.hasCertutilCmd();
  console.log(chalk.cyan('Certutil installed at: %s'),
              utils.collapseHomeDir(certutilPath));
  adb.findDevices()
    .then(function(devices) {
      var deviceList = adb.getDevicesList(devices);

      function handleAnswers(answers) {
        if (!answers) {
          answers = {};
          answers['device-id'] = utils.trimBrackets(deviceList[0]);
        }
        var deviceId = answers['device-id'];
        console.log(chalk.cyan('Finding default profile'));
        adb.getProfilePaths(deviceId)
          .then(function(profilePath) {
            console.log(chalk.cyan('[%s] Found %s'), deviceId, profilePath);
            console.log(chalk.cyan('Pulling certs files'));

            var certTargetPath = settings.certTargetPath;
            var keyTargetPath = settings.keyTargetPath;
            var certDevicePath = path.join(profilePath + '/cert9.db');
            var keyDevicePath = path.join(profilePath + '/key4.db');
            var promises = [
              pullCert(deviceId, certDevicePath, certTargetPath),
              pullCert(deviceId, keyDevicePath, keyTargetPath)
            ];
            Promise.all(promises).then(function() {
              console.log('Certs pulled \\o/');
              clearCertPassword()
                .then(function() {
                  addCertToDb().then(function() {
                    checkCertIsValid().then(function() {
                      console.log('Cert is valid o/');

                      var certReadStream = fs.createReadStream(certTargetPath);
                      var keyReadStream = fs.createReadStream(keyTargetPath);

                      var promises = [
                        adb.pushFile(deviceId, certDevicePath, certReadStream),
                        adb.pushFile(deviceId, keyDevicePath, keyReadStream)
                      ];

                      Promise.all(promises).then(function() {
                        console.log(chalk.green(
                            '[%s] Successfully pushed certs'), deviceId);
                        adb.rebootDevice(deviceId).catch(utils.handleError);
                      }).catch(utils.handleError);
                    }).catch(utils.handleError);
                  }).catch(utils.handleError);
                }).catch(utils.handleError);
            }).catch(utils.handleError);
          }).catch(utils.handleError);
      }

      if (deviceList.length > 1) {
        inquirer.prompt([questions.chooseDevice(deviceList)],
                        handleAnswers);
      } else {
        handleAnswers();
      }
    }).catch(utils.handleError);
}


module.exports = {
  enableProxy: enableProxy,
  disableProxy: disableProxy,
  addCerts: addCerts,
};
