'use strict';

var path = require('path');

module.exports = {
  userJsPath: '/data/local/user.js',
  profileDir: '/data/b2g/mozilla',
  certTargetPath: path.join(__dirname + '/../tmp/cert9.db'),
  keyTargetPath: path.join(__dirname + '/../tmp/key4.db'),
  certDir: path.join(__dirname + '/../certs/'),
};
