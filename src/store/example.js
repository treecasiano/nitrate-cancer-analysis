import exampleApi from "../api/example";

const actions = {
  async getExampleGeoJSON({ commit }) {
    const exampleGeoJSON = await exampleApi.getGeoJSON();
    return commit("setExampleGeoJSON", exampleGeoJSON.data);
  },
};

const mutations = {
  setExampleGeoJSON(state, exampleData) {
    state.exampleGeoJSON = exampleData;
  },
};

const state = {
  exampleGeoJSON: {},
};

const getters = {};

export default {
  actions,
  getters,
  mutations,
  namespaced: true,
  state,
};
