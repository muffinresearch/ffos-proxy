'use strict';

var chalk = require('chalk');
var Promise = require('es6-promise').Promise;
var _ = require('underscore');
var debug = true;

_.templateSettings = {
  interpolate: /\{\{(.+?)\}\}/g
};

var blockRX = new RegExp('^/\\* START FFOS-PROXY.*?\\*/\\n' +
                         '([\\s\\S]*?)' +
                         '\\n/\\* END FFOS-PROXY.*?\\*/$', 'm');

function trimBrackets(input) {
  return input.replace(/ \(.*?\)/, '').trim();
}

function readStream(res) {
  return new Promise(function(resolve, reject) {
    var chunks = [];
    res.setEncoding('utf8');
    res.on('data', function(chunk) { chunks.push(chunk); });
    res.on('end', function() {
      var body = Buffer.concat(chunks);
      resolve(body);
    });
    res.on('error', reject);
  });
}

function handleError(err) {
  if (debug === true) {
    console.error(err.stack);
  } else {
    console.error(chalk.red(err.toString()));
  }
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

module.exports = {
  containsProxyConf: containsProxyConf,
  detectLegacyConf: detectLegacyConf,
  extractProxyBlock: extractProxyBlock,
  handleError: handleError,
  hasProxyBlock: hasProxyBlock,
  readStream: readStream,
  replaceProxyBlock: replaceProxyBlock,
  templateProxyBlock: templateProxyBlock,
  trimBrackets: trimBrackets,
};

