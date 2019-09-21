import wellsApi from "../api/wells";

const actions = {
  async displayData({ commit, status }) {
    return commit("setDisplayStatus", status);
  },
  async getData({ commit }) {
    commit("setLoadingStatus", true);
    const results = await wellsApi.getData();
    commit("setLoadingStatus", false);
    return commit("setData", results.data);
  },
};

const mutations = {
  setData(state, data) {
    state.data = data;
  },
  setDisplayStatus(state, status) {
    state.displayStatus = status;
  },
  setDisplayStatusIDW(state, status) {
    state.displayStatusIDW = status;
  },
  setIDW(state, data) {
    state.idw = data;
  },
  setLoadingStatus(state, loading) {
    state.loading = loading;
  },
};

const state = {
  data: {},
  displayStatus: true,
  displayStatusIDW: true,
  idw: {},
  loading: false,
};

const getters = {};

export default {
  actions,
  getters,
  mutations,
  namespaced: true,
  state,
};
