const bodyParser = require("body-parser");
const config = require("config");
const cookieParser = require("cookie-parser");
const express = require("express");
const expressOpenapi = require("express-openapi");
const path = require("path");
const pathToSwaggerUi = require("swagger-ui-dist").absolutePath();
const pkg = require("./package");

const ExampleService = require("./lib/exampleService");
const pgFactory = require("./lib/pg");

const env = process.env.NODE_ENV ? process.env.NODE_ENV : "development";

// Set timezone for app in case its different than system timezone.
process.env.TZ = "UTC";

(async function init() {
  const logger = console;

  try {
    const pg = pgFactory({
      config: config.get("pg"),
    });

    const exampleService = new ExampleService({ pg });

    const app = express();

    app.use("/files", express.static("files"));
    app.use("/js", express.static("public/js"));

    app.use(
      bodyParser.json({
        limit: "50mb",
      })
    );

    app.use(
      bodyParser.urlencoded({
        extended: false,
      })
    );
    app.use(cookieParser());

    app.options("/*", (req, res) => {
      res.header("Access-Control-Allow-Methods", "GET,POST OPTIONS");
      return res.status(200).send();
    });

    app.use(express.static(path.join(__dirname, "client/dist")));

    // api docs
    app.get("/swagger-ui", (req, res, next) => {
      // add url to querystring if it isn't there
      if (!req.query.url) {
        res.redirect("/swagger-ui?url=/api/docs");
        return;
      }
      next();
    });

    app.use("/swagger-ui", express.static(pathToSwaggerUi));

    // Middleware for disabling caching on api routes
    app.use("/api", (req, res, next) => {
      res.set({
        "Cache-Control": "no-store, must-revalidate",
        Expires: "0",
      });
      next();
    });

    expressOpenapi.initialize({
      app,
      apiDoc: {
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
      },
      dependencies: {
        env,
        exampleService,
        logger,
      },
      paths: "./routes",
      exposeApiDocs: true,
      docsPath: "/docs",
      // eslint-disable-next-line
      errorMiddleware(err, req, res, next) {
        logger.error(err);
        return res.status(400).json(err);
      },
    });

    app.get("/*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist/index.html"));
    });

    const port = 3000;
    app.listen(port, () => console.log(`App launched on port ${port}`));
  } catch (e) {
    logger.error(e);
  }
})();
