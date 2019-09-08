import exampleApi from "../api/example";

const actions = {
  async getExampleList({ commit }) {
    const exampleList = await exampleApi.list();
    return commit("setExampleList", exampleList.data);
  },
  async getExampleGeoJSON({ commit }) {
    const exampleGeoJSON = await exampleApi.getGeoJSON();
    return commit("setExampleGeoJSON", exampleGeoJSON.data);
  },
};

const mutations = {
  setExampleList(state, exampleData) {
    state.exampleList = exampleData;
  },
  setExampleGeoJSON(state, exampleData) {
    state.exampleGeoJSON = exampleData;
  },
};

const state = {
  exampleList: [],
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
