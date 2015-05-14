'use strict';

var fs = require('fs');

var esprima = require('esprima');
var estraverse = require('estraverse');
var glob = require('glob');

var Table = require('cli-table');
var _ = require('lodash');

function scanString(str) {
  var ast = esprima.parse(str, {
    tolerant: true
  });

  var counter = (function() {
    var stats = {
      'variable': {},
      'function': {},
      'property': {}
    };

    return {
      addVariable: function(identifier) {
        this.add('variable', identifier);
      },

      addFuntion: function(identifier) {
        this.add('function', identifier);
      },

      addProperty: function(identifier) {
        this.add('property', identifier);
      },

      add: function(type, identifier) {
        var info = stats[type];
        if (!info || (typeof identifier === 'undefined')) {
          return;
        }

        if (typeof info[identifier] !== 'number') {
          info[identifier] = 1;
        } else {
          info[identifier] += 1;
        }
      },

      getStat: function() {
        return stats;
      }
    };
  }());

  estraverse.traverse(ast, {
    enter: function(node, parent) {
      switch (node.type) {
        case 'VariableDeclarator':
          counter.addVariable(node.id.name);
          break;

        case 'FunctionDeclaration':
        case 'FunctionExpression':
          // 函数名
          if (node.id) {
            counter.addFuntion(node.id.name);
          }

          // 形参
          var params = node.params || [];
          params.forEach(function(param, idx) {
            counter.addVariable(param.name);
          });
          break;

        case 'ObjectExpression':
          var properties = node.properties || [];
          properties.forEach(function(pro, idx) {
            if (pro.type == 'Property') {
              counter.addProperty(pro.key.name);
            }
          });
          break;
      }
    },
    leave: function(node, parent) {
    }
  });

  return counter.getStat();
}

function scanFiles(pattern, options) {
  var files = glob.sync(pattern, options);

  var fileStat = {};
  files.forEach(function(file) {
    var fileContent = fs.readFileSync(file);

    fileStat[file] = scanString(fileContent);
  });

  return fileStat;
}

function cliReport(stats, config) {
  config = config || {};
  var topCount = 5;
  var table = new Table({
    head: ['name', 'counts', 'type']
  });

  var total = {};
  _.forOwn(stats, function(stat, fileName) {
    _.forOwn(stat, function(obj, type) {
      if (!total[type]) {
        total[type] = {};
      }
      _.forOwn(obj, function(count, name) {
        if (total[type][name]) {
          total[type][name] += count;
        } else {
          total[type][name] = count;
        }
      });
    })
  });

  _.forOwn(total, function(value, type) {
    var rows = [];
    _.forOwn(value, function(count, name) {
      rows.push([name, count, type]);
    });

    // 排序
    rows.sort(function(a, b) {
      return b[1] - a[1];
    });

    if (topCount && rows.length > topCount) {
      rows.length = topCount;
    }

    table.push.apply(table, rows);
  });

  console.log(table.toString());
}

exports.scanString = scanString;
exports.scanFiles = scanFiles;
exports.cliReport = cliReport;
