import wellsApi from "../api/wells";

const actions = {
  async getData({ commit }) {
    const wells = await wellsApi.getData();
    return commit("setData", wells.data);
  },
};

const mutations = {
  setData(state, data) {
    state.data = data;
  },
};

const state = {
  data: {},
};

const getters = {};

export default {
  actions,
  getters,
  mutations,
  namespaced: true,
  state,
};
