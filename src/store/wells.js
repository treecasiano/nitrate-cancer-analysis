import wellsApi from "../api/wells";

const actions = {
  async displayData({ commit, status }) {
    return commit("setDisplayStatus", status);
  },
  async getData({ commit }) {
    commit("setLoadingStatus", true);
    const wells = await wellsApi.getData();
    commit("setLoadingStatus", false);
    return commit("setData", wells.data);
  },
};

const mutations = {
  setData(state, data) {
    state.data = data;
  },
  setLoadingStatus(state, loading) {
    state.loading = loading;
  },
  setDisplayStatus(state, status) {
    state.displayStatus = status;
  },
};

const state = {
  data: {},
  displayStatus: false,
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
