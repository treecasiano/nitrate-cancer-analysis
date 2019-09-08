const pkg = require("../package");

const apiDoc = {
  basePath: "/api",
  definitions: {},
  info: {
    title: pkg.name,
    version: pkg.version,
  },
  paths: {},
  swagger: "2.0",
  "x-express-openapi-schema-extension": {
    definitions: {
      schema: {
        properties: {
          anyOf: {
            type: "array",
            items: {
              $ref: "#/definitions/schema",
            },
          },
          oneOf: {
            type: "array",
            minItems: 1,
            items: {
              $ref: "#/definitions/schema",
            },
          },
        },
      },
    },
  },
};

module.exports = apiDoc;
