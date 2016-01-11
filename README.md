# gitevents-tito

A [gitevents](https://github.com/gitevents/) plugin for adding / updating events in [Tito](https://ti.to).

## Installation

```
npm i gitevents-tito --save
```

## Prerequisites

- You will need a [Tito](https://ti.to) account to use this plugin.
- Access to V2 of the Tito API
 
 ## Usage
 
You will first need to instantiate an instance of the plugin making sure to pass in your Tito API access credentials:
 
 ```
 var giteventsTito = require('gitevents-tito');
 
 var tito = giteventsTito({
  authToken: <YOUR_AUTH_TOKEN>
  account: <YOUR_ACCOUNT_NAME>
 });
 ```

Once you have an instance of the plugin you can call the following methods:

- `createEvent` - Create a new event in Tito
- `UpdateEvent` - Update an existing event in Tito
- `duplicateEvent` - Duplicate an existing event in Tito
- `getLatestEvent` - Get the latest event posted in Tito

### Creating a new event

A new event can be created from a Github webhook payload.

```
tito.createNewEvent(githubPayload, function (err, event) {
  // ...
});
```

### Updating an existing event

An existing event can be updated from a Github webhook payload.

```
tito.updateEvent(existingEventJSON, githubPayload, function (err, event) {
  // ...
});
```

### Duplicating an existing event

An existing event can be duplicated.

```
tito.updateEvent(existingEventJSON, function (err, event) {
  // ...
});
```

### Getting the latest event

The latest event added can be retrieved.

```
tito.getLatestEvent(function (err, event) {
  //...
});
```
