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

});
