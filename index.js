'use strict'

var async = require('async')
var moment = require('moment')
var parser = require('markdown-parse');
var tito = require('tito-api')

module.exports = GitEventsTito

function GitEventsTito(opts) {
  if (!(this instanceof GitEventsTito)) return new GitEventsTito(opts)

  this.tito = tito({ authToken: opts.authToken, account: opts.account });
}

GitEventsTito.prototype.createEvent = function (payload, cb) {
  var self = this;

  async.waterfall([
    function(cb) { self.getLatestEvent(cb); },
    function(event, cb) { self.duplicateEvent(event, cb); },
    function(duplicatedEvent, cb) { self.updateEvent(payload, cb); }
  ], cb)
}

GitEventsTito.prototype.updateEvent = function (payload, cb) {
  var updatedEvent;

  var titoUpdateEvent = function(err, eventDetails){
    this.tito.updateEvent(eventDetails.slug, eventDetails)
      .on('data', function(data) { updatedEvent = data; })
      .on('end', function() { cb(null, updatedEvent); })
  }

  this.getEventDetails(payload, titoUpdateEvent.bind(this));
}

GitEventsTito.prototype.duplicateEvent = function (event, cb) {
  var duplicatedEvent;

  this.tito.duplicate(event.attributes.slug)
    .on('data', function(data) { duplicatedEvent = data; })
    .on('end', function() { cb(null, duplicatedEvent); })
}

GitEventsTito.prototype.getLatestEvent = function (cb) {
  var events;

  this.tito.events()
    .on('data', function (data) { events = data; })
    .on('end', function(){ cb(null, events[0]); })
}

GitEventsTito.prototype.issueIsValid = function (body) {
  if (!body.attributes) return false

  if (!body.attributes.name && !body.attributes.date && !body.attributes.venue && !body.attributes.address) return false

  return true
};

GitEventsTito.prototype.getEventSlug = function (date) {
  var m = moment(date.replace(/\//g, ' '), 'DD MM YYYY');

  return m.format('MMMM').toLowerCase() + '-' + m.format('YYYY')
}

GitEventsTito.prototype.getEventDetails = function (payload, cb) {
  var extractEventDetails = function(error, body) {
    if (error) return new Error(error);

    if (this.issueIsValid(body)) {
      var slug = this.getEventSlug(body.attributes.date)
      var startDate = moment(body.attributes.date.replace(/\//g, ' '), "DD MM YYYY").format();

      cb(null, {
        data: {
          slug: slug,
          'start-date': startDate
        }
      })
    }

    return new Error('invalid event info - body contains no attributes.');
  }

  parser(payload.issue.body, extractEventDetails.bind(this));
}
