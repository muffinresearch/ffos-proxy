'use strict';

var input = require('./input/interfaces').interfaces;
var network = require('../lib/network');

describe('Network utils', function(){

  it('should extract the main interface', function(){
    assert.include(network.getIps(input), '192.168.10.10 (en0)');
  });

  it('should extract localhost', function(){
    assert.include(network.getIps(input), '127.0.0.1 (lo0)');
  });

  it('should extract vboxnet', function(){
    assert.include(network.getIps(input), '192.168.59.3 (vboxnet1)');
  });

  it('should not extract ipV6', function(){
    assert.notInclude(network.getIps(input), 'fe80::1 (lo0)');
  });

  it('should be a list', function(){
    assert.isArray(network.getIps(input));
  });

});
