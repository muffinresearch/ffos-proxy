'use strict';

var utils = require('../lib/utils');

describe('utils.trimBrackets()', function(){

  it('should trim the brackets', function(){
    assert.equal(utils.trimBrackets('whatever ()'), 'whatever');
  });

  it('should return the string unmolested', function(){
    assert.equal(utils.trimBrackets('whatever'), 'whatever');
  });

  it('should trim whitespace', function(){
    assert.equal(utils.trimBrackets(' whatever '), 'whatever');
  });

  it('should collapse homedir to ~', function(){
    assert.equal(utils.collapseHomeDir('/Users/foo/', '/Users/foo'), '~');
  });

  it('should not collapse homedir to ~', function(){
    assert.equal(utils.collapseHomeDir('/Users/foo', '/Users/foo'),
                 '/Users/foo');
  });

  it('should collapse homedir to ~/bar', function(){
    assert.equal(utils.collapseHomeDir('/Users/foo/bar', '/Users/foo'),
                 '~/bar');
  });

  it('should not collapse homedir', function(){
    assert.equal(utils.collapseHomeDir('/foo', '/Users/foo'), '/foo');
  });

});
