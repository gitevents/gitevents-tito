'use strict'

var nock = require('nock')
var parser = require('markdown-parse')
var test = require('tape')

var payload = require('../test/common/payload')
var credentials = require('../test/common/tito.credentials')

var tito = require('../index')(credentials)

test('getEventDetails', function(t) {
  t.plan(2)
  tito.getEventDetails(payload, function(err, eventDetails) {
    t.equal(eventDetails.data.slug, 'december-2099')
    t.equal(eventDetails.data['start-date'], '2099-12-31T00:00:00+00:00')
  })
})

test('isIssueValid', function (t) {
  t.plan(1)
  parser(payload.issue.body, function(err, body) {
    t.equal(tito.issueIsValid(body), true)
  })
})

test('getEventSlug', function (t) {
  t.plan(1)
  t.equal(tito.getEventSlug('31/12/2099'), 'december-2099')
})

test('getLatestEvent', function(t) {
  t.plan(1)

  nock(/api\.tito\.io/)
    .get(/\/v2\/.*\/events/)
    .reply(200, {
      data: [
        { id: 3 },
        { id: 2 },
        { id: 1 }
      ]
    });

  tito.getLatestEvent(function(err, event) {
    t.equal(event.id, 3)
  })
})
