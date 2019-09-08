const axios = require("axios");

test("Retrieves one record by id from hello_table", async () => {
  try {
    const results = await axios({
      method: "get",
      url: "http://localhost:3000/api/example/1"
    });
    expect(results.status).toEqual(200);
    expect(results.data).toBeInstanceOf(Object);
  } catch (e) {
    console.log(e);
    throw e;
  }
});
