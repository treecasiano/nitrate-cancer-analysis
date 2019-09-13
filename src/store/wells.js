import wellsApi from "../api/wells";

const actions = {
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
};

const state = {
  data: {},
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
