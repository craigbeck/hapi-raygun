# hapi-raygun

[![npm version](https://badge.fury.io/js/hapi-raygun.svg)](https://www.npmjs.com/package/hapi-raygun) [![dependencies status](https://david-dm.org/craigbeck/hapi-raygun.svg)](https://david-dm.org/craigbeck/hapi-raygun) [![npm downloads](https://img.shields.io/npm/dt/hapi-raygun.svg)](https://www.npmjs.com/package/hapi-raygun)

A [Hapi.js](http://hapijs.com) plugin for reporting server-side errors to [Raygun](https://raygun.io).

## Usage

```js
var Hapi = require("hapi");
var Raygun = require("hapi-raygun");

var server = new Hapi.Server();

server.register({
  register: Raygun,
  options: {
    apiKey: /* Your Raygun API key */
  }
}, function (err) {
  if (err) {
    throw err;
  }

  server.start(function () {
    console.log("Server running at:", server.info.uri);
  });
});
```

## Configuration

- `options`
  - `apiKey` - String. Your Raygun API key. If not set, no error handler will be registered and plugin will be a no-op.
  - `filters` - Array, default `["password"]`. Array of strings to filter from payload sent to Raygun (see [this](https://github.com/MindscapeHQ/raygun4node#sending-request-data) for example)
  - `log` - Boolean, default `false`. If `true`, uses `server.log()` to log when plugin logs calls to Raygun. Depends on logging to be setup properly, i.e. use [good](https://github.com/hapijs/good) and [good-console](https://github.com/hapijs/good-console) configured to log server log events.
  - `user` - Function. Takes a callback accepting a single argument and returning the request's user context. See Raygun [documentation for user callback](https://github.com/MindscapeHQ/raygun4node#affected-user-tracking)
  - `version` - String. Format of "n.n.n.n" where `n` is a number. See [raygun docs](https://github.com/MindscapeHQ/raygun4node#version-tracking)
