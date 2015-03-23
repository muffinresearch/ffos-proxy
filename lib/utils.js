var _ = require('underscore');

_.templateSettings = {
  interpolate: /\{\{(.+?)\}\}/g
};

var blockRX = /^\/\* START FFOS-PROXY.*?\*\/\n([\s\S]*?)\n\/\* END FFOS-PROXY.*?\*\/$/m;


function handleError(err) {
  console.error(err.toString);
  // TODO: Set the debug global based on args.
  if (globals.debug === true) {
    console.log(err.stack);
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

module.exports = {
  extractProxyBlock: extractProxyBlock,
  hasProxyBlock: hasProxyBlock,
  templateProxyBlock: templateProxyBlock,
  replaceProxyBlock: replaceProxyBlock,
  handleError: handleError,
};

