import axios from "axios";

export default {
  getData() {
    return axios({
      method: "get",
      url: `tracts.geojson`,
    });
  },
};
