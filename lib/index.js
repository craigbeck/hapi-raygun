var Joi = require("joi");
var Hoek = require("hoek");
var Raygun = require('raygun');
var pkg = require("../package.json");


var optionsSchema = Joi.object({
  apiKey: Joi.string().requied(),
  log: Joi.boolean(),
  user: Joi.func()
});

var defaults = {
  apiKey: process.env.RAYGUN_API_KEY,
  log: false
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

    client.send(error, {}, function () {

      if (config.log) {
        server.log(["debug", "hapi-raygun"], {
          message: "request-error reported to raygun",
          error: error
        });
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
