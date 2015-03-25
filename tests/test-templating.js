'use strict';

var input = require('./input/proxyblock');
var utils = require('../lib/utils');

var proxyIp = '192.168.0.10';
var proxyPort = '9999';

var proxyData = {
  proxy_port: proxyPort,
  proxy_ip: proxyIp,
};


describe('Template extraction', function(){

  it('should return the "Blah Whatever" from testBlob', function(){
    assert.equal(utils.extractProxyBlock(input.testBlob)[1],
                                         'Blah\nWhatever');
    assert.notInclude(utils.extractProxyBlock(input.testBlob)[1],
                                              'something');
  });

  it('should detect a proxy block in testBlob', function(){
    assert.ok(utils.hasProxyBlock(input.testBlob));
  });

  it('should not detect a proxy block in testBlob2', function(){
    assert.notOk(utils.hasProxyBlock(input.testBlob2));
  });

  it('should containe proxy_ip in templated output', function(){
    assert.include(utils.templateProxyBlock(input.templateBlob, proxyData),
                   'proxy_ip: 192.168.0.10');
  });

  it('should containe proxy_port in templated output', function() {
    assert.include(utils.templateProxyBlock(input.templateBlob, proxyData),
                   'proxy_port: 9999');
  });

  it('Replaced proxy block should contain ip', function(){
    var templated = utils.templateProxyBlock(input.templateBlob, proxyData);
    var replaced = utils.replaceProxyBlock(input.testBlob, templated);
    assert.include(replaced, 'something');
    assert.include(replaced, 'one more thing');
    assert.notInclude(replaced, 'Blah');
    assert.notInclude(replaced, 'Blah\nWhatever');
    assert.include(replaced, 'proxy_port: 9999');
    assert.include(replaced, 'proxy_port: 9999');
  });

  it('should detect proxy configuration', function(){
    assert.ok(utils.containsProxyConf(input.nonDelimtedBlob));
    assert.notOk(utils.hasProxyBlock(input.nonDelimtedBlob));
  });

  it('should not detect proxy conf configuration', function(){
    assert.notOk(utils.containsProxyConf('whatever'));
    assert.notOk(utils.hasProxyBlock('whatever'));
  });

  it('should throw on old proxy conf being detected', function() {
    assert.throws(function() {
      utils.detectLegacyConf(input.nonDelimtedBlob);
    }, /Refusing to process/);
  });
});

