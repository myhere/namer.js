var esprima = require('esprima');
var fs = require('fs');
var path = require('path');

var fileName = path.join(__dirname, 'fixtures/config.js');
var code = fs.readFileSync(fileName);

var ast = esprima.parse(code);
var out = JSON.stringify(ast, null, 2);

fs.writeFileSync(fileName + '.ast', out);
