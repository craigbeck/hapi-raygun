# hapi-raygun

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
  - `apiKey` - String, required. Your Raygun API key
  - `log` - Boolean, default `false`. If `true`, uses `server.log()` to log when plugin logs calls to Raygun. Depends on logging to be setup properly, i.e. use `good` + `good-console` configured to log server log events.
  - `user` - Function. Takes a callback accepting a single argument and returning the request's user context. See Raygun [documentation for user callback](https://github.com/MindscapeHQ/raygun4node#affected-user-tracking) 

