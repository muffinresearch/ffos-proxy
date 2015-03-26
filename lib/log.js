var chalk = require('chalk');

function buildLogFunc(colour) {
  function log() {
    var args = Array.prototype.slice.call(arguments);
    var str = args.shift();
    args.unshift(chalk[colour](str));
    console.log.apply(this, args);
  }
  return log.bind(console);
}

module.exports = {
  info: buildLogFunc('white'),
  error: buildLogFunc('red'),
  warn: buildLogFunc('yellow'),
  success: buildLogFunc('green'),
};
