'use strict'

var nock = require('nock')
var parser = require('markdown-parse')
var test = require('tape')

var payload = {
  issue: {
    body: '---\r\nname: foo\r\nvenue: bar\r\naddress: baz\r\ndate: 31.12.2099\r\n---'
  }
}

var tito = require('../index')({
  authToken: 'foo',
  account: 'bar'
});

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

test('duplicateEvent', function (t) {
  t.plan(1)

  var eventSlug = 'foo'
  var duplicateEventSlug = eventSlug + '-copy'

  var event = {
    attributes: {
      slug: eventSlug
    }
  }

  var duplicateEvent = {
    attributes: {
      slug: duplicateEventSlug
    }
  }

  nock(/api\.tito\.io/)
    .post(/\/v2\/.*\/.*\/duplicate/)
    .reply(201, {
      data: duplicateEvent
    })

  tito.duplicateEvent(event, function(err, event) {
    t.equal(event.attributes.slug, duplicateEventSlug)
  })
});

test('updateEvent', function (t) {
  t.plan(1);

  var updatedEvent = {
    attributes: {
      date: '2099-12-31T00:00:00+00:00'
    }
  }

  nock(/api\.tito\.io/)
    .patch(/\/v2\/.*\/.*/)
    .reply(200, {
      data: updatedEvent
    })

  tito.updateEvent(payload, function(err, event) {
    t.deepEqual(event, updatedEvent);
  })
});

test('createEvent', function (t) {
  t.plan(1);

  nock.cleanAll();

  var event = {
    attributes: {
      slug: 'december-2099'
    }
  }

  var duplicateEvent = {
    attributes: {
      slug: 'december-2099-copy'
    }
  }

  var updatedEvent = {
    attributes: {
      date: '2099-12-31T00:00:00+00:00'
    }
  }

  nock(/api\.tito\.io/)
    .get(/\/v2\/.*\/events/)
    .reply(200, { data: [event] })
    .post(/\/v2\/.*\/.*\/duplicate/)
    .reply(201, { data: duplicateEvent })
    .patch(/\/v2\/.*\/.*/)
    .reply(200, { data: updatedEvent })

  tito.createEvent(payload, function(err, event) {
    t.deepEqual(event, updatedEvent);
  })
});
