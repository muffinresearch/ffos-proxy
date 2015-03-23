var start = '/* START FFOS-PROXY Additions ========================== */';
var end = '/* END FFOS-PROXY Additions ============================ */';

var testBlob = [
  'something',
  start,
  'Blah',
  'Whatever',
  end,
  'one more thing',
].join('\n');

var testBlob2 = 'nada';

var templateBlob = [
  start,
  'proxy_ip: {{ proxy_ip }}',
  'proxy_port: {{ proxy_port }}',
  end,
].join('\n');


module.exports = {
  testBlob: testBlob,
  testBlob2: testBlob2,
  templateBlob: templateBlob,
};
