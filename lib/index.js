var Joi = require("joi");
var Hoek = require("hoek");
var Raygun = require('raygun');
var pkg = require("../package.json");


var optionsSchema = Joi.object({
  apiKey: Joi.string().requied(),
  log: Joi.boolean(),
  user: Joi.func(),
  filters: Joi.array().including(Joi.string())
});

var defaults = {
  apiKey: process.env.RAYGUN_API_KEY,
  log: false,
  filters: ["password"]
};


exports.register = function (server, options, next) {

  Joi.assert(options, optionsSchema);
  var config = Hoek.applyToDefaults(defaults, options);

  var client = new Raygun.Client().init({
    apiKey: config.apiKey
  });

  if (config.user) {
    client.user = config.user;
  }

  server.on("request-error", function (request, error) {

    client.send(error, {}, function (status) {

      if (config.log && status === 202) {
        server.log(["debug", pkg.name], {
          message: "request-error reported to raygun",
          status: status,
          payload: error
        });
      }
      else {
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

      throw error;
    }, request);
  });

  next();
};

exports.register.attributes = {
  name: pkg.name,
  version: pkg.version
};
