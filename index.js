'use strict'

var tito = require('tito-api');
var async = require('async');

module.exports = function(config) {
  var t = tito(config.api)

  async.series([
    function(cb){
      t.events(config.account).on('data', function (events) {
        console.log(events)
        cb(null, events);
      })
    }
  ],
  function(err, results){
    if err { console.error(err) }
    console.log(results)
  });
};
