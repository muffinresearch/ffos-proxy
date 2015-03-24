var Promise = require('es6-promise').Promise;
var mockery = require('mockery');

var devices = require('./input/adb').devices;
var adb = require('../lib/adb');


describe('getDevicesList()', function(){

  it('should find only FFOS devices', function(){
    var deviceList = adb.getDevicesList(devices);
    assert.notInclude(deviceList, '4df755831973cf65 (Android)');
    assert.include(deviceList, 'f0694135 (FFOS)');
  });

  it('should find all devices if onlyFFOS is false', function(){
    var deviceList = adb.getDevicesList(devices, {onlyFFOS: false});
    assert.include(deviceList, '4df755831973cf65 (Android)');
    assert.include(deviceList, 'f0694135 (FFOS)');
  });

  it('should raise exception if no devices', function(){
    assert.throws(function() {
      adb.getDevicesList([]);
    }, /No devices are connected/);
  });

  it('should raise exception if nothing passed', function(){
    assert.throws(function() {
      adb.getDevicesList();
    }, /No devices are connected/);
  });

});


describe('findDevices()', function(){
  var fxosId = '8675309';
  var androidId = 'ILIKEROBOTS';

  beforeEach(function() {
    mockery.registerMock('adbkit', {
      createClient: function() {
        return {
          listDevices: function() {
            return new Promise(function(resolve) {
              resolve([
                { id: fxosId, type: 'device' },
                { id: androidId, type: 'device' }
              ]);
            });
          },
          shell: function(deviceId) {
            return new Promise(function(resolve) {
              // Note: '0' means FxOS *was* detected.
              var result = (deviceId === fxosId) ? '0' : '1';
              resolve(result + '\r\n');
            });
          }
        };
      },
      util: {
        readAll: function(input) {
          return new Buffer(input, 'utf8');
        }
      }
    });

    mockery.enable({
      warnOnReplace: false,
      warnOnUnregistered: false,
      useCleanCache: true
    });
  });

  afterEach(function() {
    mockery.disable();
  });

  it('should find all devices', function(done){
    var adb = require('../lib/adb');
    adb.findDevices().catch(function(err) {
      done(err);
    }).then(function(results) {
      // Ensure all the mocks were called, and with the expected parameters
      var foundFirefoxOS = false;
      var foundAndroid = false;
      results.forEach(function(result) {
        assert.property(result, 'isFirefoxOS',
                       'isFirefoxOS should be set as a property');
        if (result.id === fxosId) {
          foundFirefoxOS = true;
        }
        if (result.id === androidId) {
          foundAndroid = true;
        }
      });
      assert.ok(foundAndroid, 'Should find the android device');
      assert.ok(foundFirefoxOS, 'Should find the FFOS device');
      done();
    }).catch(function(err) {
      done(err);
    });
  });
});
