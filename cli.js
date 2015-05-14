var fs = require('fs');
var program = require('commander');
var _ = require('lodash');

var namer = require('./');

var json = {};
try {
  json = require('./package.json');
} catch(e) {
}

program
  .version(json.version || '0.0.0')
  .usage('<file> ...')
  .parse(process.argv);

var files = program.args;
if (!files.length) {
  program.outputHelp();
} else {
  var total = {};
  files.forEach(function(file) {
    var stat = namer.scanFiles(file);
    _.assign(total, stat);
  });

  namer.cliReport(total);
}
