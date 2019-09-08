function factory(logger, exampleService) {
  GET.apiDoc = {
    summary: "Get a list of all records in the example hello_table database",
    tags: ["Example"],
    produces: ["application/json"],
    parameters: [],
    responses: {
      200: {
        description: "List of records",
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
      result = await exampleService.list();
    } catch (e) {
      logger.error(e);
      return res.status(500).json({ message: "Server Error" });
    }
    return res.status(200).json(result);
  }
}

module.exports = factory;
