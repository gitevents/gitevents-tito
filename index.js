'use strict'

var async = require('async')
var moment = require('moment')
var parser = require('markdown-parse');
var tito = require('tito-api')

module.exports = GitEventsTito

function GitEventsTito(opts) {
  if (!(this instanceof GitEventsTito)) return new GitEventsTito(opts)
  this.t = tito({ authToken: opts.authToken, account: opts.account });
};

GitEventsTito.prototype.createEvent = function createEvent() {
  async.waterfall([
    function(cb) { getLatestEvent(cb); },
    function(event, cb) { duplicateEvent(t, event, cb); },
    function(duplicate, cb) { updateEvent(t, duplicate, cb); }
  ],
  function(err, results) { if (err) console.error(err) });
}

GitEventsTito.prototype.updateEvent = function updateEvent(t, duplicate, cb) {
  var updatedEvent = [];
  var x = getEventDetails(payload, function(eventDetails){
    console.log(eventDetails);
    t.updateEvent(duplicate.attributes.slug, x)
    .on('data', function(data) { updatedEvent.push(data); })
    .on('end', function() { cb(null, updatedEvent); })
  });
}

GitEventsTito.prototype.duplicateEvent = function duplicateEvent(t, event, cb) {
  var duplicate = [];
  t.duplicate(event.attributes.slug)
  .on('data', function(data) { duplicate.push(data); })
  .on('end', function() { cb(null, duplicate); })
}

GitEventsTito.prototype.getLatestEvent = function getLatestEvent(cb) {
  var events;
  this.t.events()
    .on('data', function (data) { events = data; })
    .on('end', function(){ cb(null, events[0]); })
}

GitEventsTito.prototype.issueIsValid = function issueIsValid(body) {
  if (!body.attributes) return false
  if (!body.attributes.name && !body.attributes.date && !body.attributes.venue && !body.attributes.address) return false
  return true
};

GitEventsTito.prototype.getEventSlug = function getEventSlug(date) {
  var m = moment(date.replace(/\//g, ' '), "DD MM YYYY");
  return m.format('MMMM').toLowerCase() + '-' + m.format('YYYY')
}

GitEventsTito.prototype.getEventDetails = function getEventDetails(payload, cb) {
  var that = this;
  parser(payload.issue.body, function(error, body) {
    if (error) { return new Error(error); }
    if (that.issueIsValid(body)) {
      var slug = that.getEventSlug(body.attributes.date)
      var startDate = moment(body.attributes.date.replace(/\//g, ' '), "DD MM YYYY").format();
      cb(null, {
        "data": {
          slug: slug,
          'start-date': startDate
        }
      })
    } else return new Error('invalid event info - body contains no attributes.');
  });
}
