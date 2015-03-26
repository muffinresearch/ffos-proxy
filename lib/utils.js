'use strict';

var fs = require('fs');

var _ = require('underscore');
var Promise = require('es6-promise').Promise;
require('shelljs/global');

var log = require('./log');

_.templateSettings = {
  interpolate: /\{\{(.+?)\}\}/g
};

var blockRX = new RegExp('^/\\* START FFOS-PROXY.*?\\*/\\n' +
                         '([\\s\\S]*?)' +
                         '\\n/\\* END FFOS-PROXY.*?\\*/$', 'm');

if (typeof String.prototype.endsWith !== 'function') {
  String.prototype.endsWith = function(suffix) {
    return this.indexOf(suffix, this.length - suffix.length) !== -1;
  };
}

function trimBrackets(input) {
  return input.replace(/ \(.*?\)/, '').trim();
}

function handleError(err) {
  if (global.debug === true) {
    console.error(err.stack);
  } else {
    log.error(err.toString());
  }
}

function getCertsList(certDir) {
  var files = fs.readdirSync(certDir);
  var certsList = [];
  for (var i=0; i < files.length; i++) {
    var file = files[i];
    if (file.endsWith('.pem')) {
      certsList.push(file);
    }
  }
  return certsList;
}

function extractProxyBlock(haystack) {
  return blockRX.exec(haystack);
}

function hasProxyBlock(haystack) {
  return extractProxyBlock(haystack) !== null;
}

function templateProxyBlock(templateString, context) {
  var template = _.template(templateString);
  return template(context);
}

function replaceProxyBlock(input, replacement) {
  return input.replace(blockRX, replacement);
}

function containsProxyConf(input) {
  return /network\.proxy/.exec(input);
}

function detectLegacyConf(input) {
  if (!hasProxyBlock(input) && containsProxyConf(input)) {
    throw Error('Refusing to process user.js with existing proxy conf');
  }
}

function collapseHomeDir(path, home) {
  home = home || process.env.HOME;
  home = home.replace(/\/$/, '');
  var newPath = path.replace(home + '/', '~/');
  return newPath === '~/' ? '~' : newPath;
}

function copyFile(source, target) {
  return new Promise(function(resolve, reject) {
    var rd = fs.createReadStream(source);
    var wr = fs.createWriteStream(target);
    rd.on('error', function(err) {
      reject(err);
    });
    wr.on('error', function(err) {
      reject(err);
    });
    wr.on('close', function() {
      resolve();
    });
    rd.pipe(wr);
  });
}

function hasCertutilCmd() {
  var certutilPath = which('certutil');
  if (!certutilPath) {
    throw new Error('Certuil needs to be installed see ' +
      'https://developer.mozilla.org/en-US/docs/Mozilla/Projects/NSS');
  } else {
    return certutilPath;
  }
}

module.exports = {
  collapseHomeDir: collapseHomeDir,
  containsProxyConf: containsProxyConf,
  copyFile: copyFile,
  detectLegacyConf: detectLegacyConf,
  extractProxyBlock: extractProxyBlock,
  getCertsList: getCertsList,
  handleError: handleError,
  hasCertutilCmd: hasCertutilCmd,
  hasProxyBlock: hasProxyBlock,
  replaceProxyBlock: replaceProxyBlock,
  templateProxyBlock: templateProxyBlock,
  trimBrackets: trimBrackets,
};

