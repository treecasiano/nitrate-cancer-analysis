function factory(logger, exampleService) {
  GET.apiDoc = {
    summary:
      "Get a GeoJSON object that includes all point features in hello_table",
    tags: ["Example"],
    produces: ["application/json"],
    parameters: [],
    responses: {
      200: {
        description: "Point features in geojson format",
      },
      500: {
        description: "Server Error",
      },
    },
  };

  return {
    GET,
  };

  async function GET(req, res) {
    let result;
    try {
      result = await exampleService.getGeoJSON();
    } catch (e) {
      logger.error(e);
      return res.status(500).json({ message: "Database error" });
    }
    return res.status(200).json(result);
  }
}

module.exports = factory;
