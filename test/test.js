'use strict';

var fs = require('fs');
var path = require('path');

var namer = require('../');

var _ = require('lodash');
var Table = require('cli-table');

var stats = namer.scanFiles(path.join(__dirname, '../../../search/tsrp/src/**/*.js'));

// 合并所有
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


var topCount = 5;
var table = new Table({
  head: ['name', 'counts', 'type']
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

  if (topCount) {
    rows.length = topCount;
  }

  table.push.apply(table, rows);
});
console.log(table.toString());
