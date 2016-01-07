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

  var payload = {
    issue: {
      body: "---\r\ndate: 31.12.2099\r\n---"
    }
  }

  var updatedEvent = {
    attributes: {
      date: "31.12.2099"
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
  nock.cleanAll();
  t.plan(1);

  var payload = {
    issue: {
      body: "---\r\ndate: 31.12.2099\r\n---"
    }
  }

  var event = {
    attributes: {
      slug: 'foo'
    }
  }

  var duplicateEvent = {
    attributes: {
      slug: 'foo-copy'
    }
  }

  var updatedEvent = {
    attributes: {
      date: "31.12.2099"
    }
  }

  nock(/api\.tito\.io/)
    .get(/\/v2\/.*\/events/)
    .reply(200, {
      data: [event]
    });

  nock(/api\.tito\.io/)
    .post(/\/v2\/.*\/.*\/duplicate/)
    .reply(201, {
      data: duplicateEvent
    })

  nock(/api\.tito\.io/)
    .patch(/\/v2\/.*\/.*/)
    .reply(200, {
      data: updatedEvent
    })

  tito.createEvent(payload, function(err, event) {
    t.deepEqual(event, updatedEvent);
  })
});

