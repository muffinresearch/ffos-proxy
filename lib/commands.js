'use strict';

var stream = require('stream');
var inquirer = require('inquirer');

var questions = require('./questions');
var utils = require('./utils');
var adb = require('./adb');

var USERJS = '/data/local/user.js';


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
        console.log(JSON.stringify(answers));
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
        adb.pullFile(deviceId, USERJS).then(function(res){
          utils.readStream(res).then(function(userjs) {
            // Check for any existing conf that's not delimited.
            // this will throw and error if an unMarked proxy block
            // is discovered.
            utils.detectLegacyConf(userjs);
            // Remove the existing delimited conf.
            if (utils.hasProxyBlock(userjs) &&
                utils.containsProxyConf(userjs)) {
              var newUserJS = utils.replaceProxyBlock(userjs, '');
              var readable = new stream.Readable();
              readable.push(newUserJS);
              readable.push(null);
              adb.pushContent(deviceId, USERJS, readable);
            } else {
              console.log('Nothing to do. No Proxy conf exists');
            }
          });
        }).catch(function(err) {
          utils.handleError(err);
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


function addCerts() {

}


module.exports = {
  enableProxy: enableProxy,
  disableProxy: disableProxy,
  addCerts: addCerts,
};
