const axios = require("axios");

test("Retrieves a geojson object from the hello_table", async () => {
  try {
    const results = await axios({
      method: "get",
      url: "http://localhost:3000/api/exampleGeoJSON"
    });
    expect(results.status).toEqual(200);
    expect(results.data).toBeInstanceOf(Object);
    expect(results.data.features.length).toEqual(7);
  } catch (e) {
    console.log(e);
    throw e;
  }
});
