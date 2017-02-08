var Joi = require("joi");
var Hoek = require("hoek");
var Raygun = require('raygun');
var pkg = require("../package.json");


var optionsSchema = Joi.object({
  apiKey: Joi.string().allow(""),
  tags: Joi.array(),
  log: Joi.boolean(),
  user: Joi.func(),
  filters: Joi.array().items(Joi.string()),
  version: Joi.string().regex(/^(\d+\.){2,3}\d+$/)
});

var defaults = {
  apiKey: process.env.RAYGUN_API_KEY || process.env.RAYGUN_API_TOKEN,
  log: false,
  filters: ["password"]
};

var internals = {};

internals.sendError = function (client, config) {

  return function (request, error) {

    client.send(error, {}, function (response) {

      var status = response.statusCode;

      if (status === 202) {

        if (!config.log) {
          return;
        }

        server.log(["debug", pkg.name], {
          message: "request-error reported to raygun",
          status: status,
          payload: error
        });

      } else {

        switch (status) {

          case 401: // bad api keys
            server.log(["warn", pkg.name], {
              message: "Invalid Raygun API key",
              status: status
            });
            break;

          case 403: // API limit exceeded
            server.log(["warn", pkg.name], {
              message: "Raygun API limits exceeded",
              status: status
            });
            break;

          default:  // something else
            server.log(["warn", pkg.name], {
              message: "Internal Raygun error",
              status: status
            });
        }
      }
    }, request, config.tags);
  }
};


exports.register = function (server, options, next) {

  Joi.assert(options, optionsSchema);
  var config = Hoek.applyToDefaults(defaults, options);

  if (!config.apiKey) {
    // if apiKey not set, don't register plugin
    return next();
  }

  var client = new Raygun.Client().init({
    apiKey: config.apiKey
  });

  if (config.version) {
    client.setVersion(config.version);
  }

  if (config.user) {
    client.user = config.user;
  }

  server.on("request-error", internals.sendError(client, config));

  server.log(["info", "plugins"], "Hapi-Raygun initialized");
  next();
};

exports.register.attributes = {
  name: pkg.name,
  version: pkg.version
};
